import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import { mutateStudentSchema } from "../utils/schema.js";
import courseModel from "../models/courseModel.js";
import path from "path";
import fs from "fs";

export const getStudents = async (req, res) => {
  try {
    const students = await userModel
      .find({
        role: "student",
        manager: req.user._id,
      })
      .select("name photo courses");
    const photoUrl = process.env.APP_URL + "/uploads/students/";
    const response = students.map((item) => {
      return {
        ...item.toObject(),
        photo_url: photoUrl + item.photo,
      };
    });

    return res.json({
      message: "Get Students Success",
      data: response,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await userModel.findById(id).select("name email");
    return res.json({
      message: "Get Detail Student Success",
      data: student,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const postStudent = async (req, res) => {
  try {
    const body = req.body;

    const parse = mutateStudentSchema.safeParse(body);

    if (!parse.success) {
      const errorMessages = parse.error.issues.map((err) => err.message);

      if (req?.file?.path && fs.existsSync(req?.file?.path)) {
        fs.unlinkSync(req?.file?.path);
      }

      return res.status(500).json({
        message: "Error Validation",
        data: null,
        errors: errorMessages,
      });
    }
    const hashPassword = bcrypt.hashSync(body.password, 12);
    const student = new userModel({
      name: parse.data.name,
      email: parse.data.email,
      password: hashPassword,
      photo: req.file?.filename,
      manager: req.user?._id,
      role: "student",
    });

    await student.save();
    return res.json({
      message: "Add Student Success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const parse = mutateStudentSchema
      .partial({
        password: true,
      })
      .safeParse(body);

    if (!parse.success) {
      const errorMessages = parse.error.issues.map((err) => err.message);

      if (req?.file?.path && fs.existsSync(req?.file?.path)) {
        fs.unlinkSync(req?.file?.path);
      }

      return res.status(500).json({
        message: "Error Validation",
        data: null,
        errors: errorMessages,
      });
    }

    const student = await userModel.findById(id);

    const hashPassword = parse.data?.password
      ? bcrypt.hashSync(parse.data.password, 12)
      : student.password;

    await userModel.findByIdAndUpdate(id, {
      name: parse.data.name,
      email: parse.data.email,
      password: hashPassword,
      photo: req?.file ? req.file?.filename : student.photo,
    });

    return res.json({
      message: "Update Student Success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await userModel.findById(id);
    await courseModel.findOneAndUpdate(
      {
        students: id,
      },
      {
        $pull: {
          students: id,
        },
      }
    );
    const dirname = path.resolve();
    const filePath = path.join(
      dirname,
      "public/uploads/students",
      student.photo
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await userModel.findByIdAndDelete(id);

    return res.json({
      message: "Delete Student Success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getStudentCourses = async (req, res) => {
  try {
    const studentId = req.user._id; // dari token hasil verifyToken

    const student = await userModel.findById(studentId).populate({
      path: "courses",
      model: "Course",
      select: "name thumbnail _id category",
      populate: {
        path: "category",
        select: "name -_id",
      },
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const imageBaseUrl = process.env.APP_URL + "/uploads/courses/";

    // map data biar tiap course punya thumbnail_url
    const formattedCourses = student.courses.map((course) => ({
      ...course.toObject(),
      thumbnail_url: imageBaseUrl + course.thumbnail,
    }));

    return res.json({
      message: "Get Student Courses Success",
      data: formattedCourses,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
