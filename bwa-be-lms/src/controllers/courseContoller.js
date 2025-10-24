import path from "path";
import categoryModel from "../models/categoryModel.js";
import courseModel from "../models/courseModel.js";
import userModel from "../models/userModel.js";
import { mutateCourseSchema } from "../utils/schema.js";
import fs from "fs";
import courseDetailModel from "../models/courseDetailModel.js";

export const getCourses = async (req, res) => {
  try {
    const courses = await courseModel
      .find({
        manager: req.user?._id,
      })
      .select("name thumbnail")
      .populate({
        path: "category",
        select: "name -_id",
      })
      .populate({
        path: "students",
        select: "name",
      });
    const imageUrl = process.env.APP_URL + "/uploads/courses/";

    const response = courses.map((item) => {
      return {
        ...item.toObject(),
        thumbnail_url: imageUrl + item.thumbnail,
        total_students: item.students.length,
      };
    });
    return res.json({
      message: "get Course Success",
      data: response,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find();

    return res.json({
      message: "Get Categories Success",
      data: categories,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const { preview } = req.query;

    const course = await courseModel
      .findById(id)
      .populate({
        path: "category",
        select: "name -_id",
      })
      .populate({
        path: "details",
        select: preview === "true" ? "title type youtubeId text" : "title type",
      });

    const imageUrl = process.env.APP_URL + "/uploads/courses/";
    return res.json({
      message: "Get Course Detail Success",
      data: {
        ...course.toObject(),
        thumbnail_url: imageUrl + course.thumbnail,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const postCourse = async (req, res) => {
  //console.log(req.file);

  try {
    const body = req.body;

    const parse = mutateCourseSchema.safeParse(body);

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

    const category = await categoryModel.findById(parse.data.categoryId);

    if (!category) {
      return res.status(500).json({
        message: "Category Id Not Found",
      });
    }

    const course = new courseModel({
      name: parse.data.name,
      category: category._id,
      description: parse.data.description,
      tagline: parse.data.tagline,
      thumbnail: req.file?.filename,
      manager: req.user._id,
    });

    await course.save();

    await categoryModel.findByIdAndUpdate(
      category._id,
      {
        $push: {
          courses: course._id,
        },
      },
      { new: true }
    );

    await userModel.findByIdAndUpdate(
      req.user?._id,
      {
        $push: {
          courses: course._id,
        },
      },
      { new: true }
    );

    return res.json({ message: "Create Course Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const body = req.body;
    const courseId = req.params.id;
    const parse = mutateCourseSchema.safeParse(body);

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

    const category = await categoryModel.findById(parse.data.categoryId);
    const oldCourse = await courseModel.findById(courseId);

    if (!category) {
      return res.status(500).json({
        message: "Category Id Not Found",
      });
    }

    await courseModel.findByIdAndUpdate(courseId, {
      name: parse.data.name,
      category: category._id,
      description: parse.data.description,
      tagline: parse.data.tagline,
      thumbnail: req?.file ? req.file?.filename : oldCourse.thumbnail,
      manager: req.user._id,
    });
    return res.json({ message: "Update Course Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await courseModel.findById(id);
    const dirname = path.resolve();
    const filePath = path.join(
      dirname,
      "public/uploads/courses",
      course.thumbnail
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await courseModel.findByIdAndDelete(id);

    return res.json({
      message: "Delete Course Success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const postContentCourse = async (req, res) => {
  try {
    const body = req.body;
    const course = await courseModel.findById(body.courseId);

    const content = new courseDetailModel({
      title: body.title,
      type: body.type,
      course: course._id,
      text: body.text,
      youtubeId: body.youtubeId,
    });

    await content.save();

    await courseModel.findByIdAndUpdate(
      course._id,
      {
        $push: {
          details: content._id,
        },
      },
      { new: true }
    );
    return res.json({ message: "Create Content Course Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const updateContentCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const course = await courseModel.findById(body.courseId);

    await courseDetailModel.findByIdAndUpdate(
      id,
      {
        title: body.title,
        type: body.type,
        course: course._id,
        text: body.text,
        youtubeId: body.youtubeId,
      },
      { new: true }
    );

    return res.json({ message: "Update Content Course Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deleteContentCourse = async (req, res) => {
  try {
    const { id } = req.params;

    await courseDetailModel.findByIdAndDelete(id);

    return res.json({
      message: "Delete Content Course Success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getDetailContent = async (req, res) => {
  try {
    const { id } = req.params;

    const content = await courseDetailModel.findById(id);
    return res.json({
      message: "Get Detail Content Success",
      data: content,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getStudentsByCourseId = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await courseModel.findById(id).select("name").populate({
      path: "students",
      select: "name email photo",
    });

    const photoUrl = process.env.APP_URL + "/uploads/students/";
    const studentsMap = course?.students?.map((item) => {
      return {
        ...item.toObject(),
        photo_url: photoUrl + item.photo,
      };
    });

    return res.json({
      message: "Get Student By Course Success",
      data: {...course.toObject(),
        students:studentsMap
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const postStudentToCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    await userModel.findByIdAndUpdate(body.studentId, {
      $push: {
        courses: id,
      },
    });

    await courseModel.findByIdAndUpdate(id, {
      $push: {
        students: body.studentId,
      },
    });
    return res.json({
      message: "Add Student To Course Success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deleteStudentFromCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    await userModel.findByIdAndUpdate(body.studentId, {
      $pull: {
        courses: id,
      },
    });

    await courseModel.findByIdAndUpdate(id, {
      $pull: {
        students: body.studentId,
      },
    });
    return res.json({
      message: "Delete Student From Course Success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
