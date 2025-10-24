import e from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { deleteStudent, getStudentById, getStudentCourses, getStudents, postStudent, updateStudent } from "../controllers/studentController.js";
import multer from "multer";
import { fileFilter,fileStorage } from "../utils/multer.js";
const studentRoutes = e.Router()
const upload=multer({
    storage:fileStorage('students'),
    fileFilter
})
studentRoutes.get('/students',verifyToken,getStudents)
studentRoutes.get('/students/:id',verifyToken,getStudentById)
studentRoutes.get("/student/courses", verifyToken, getStudentCourses);
studentRoutes.post('/students',verifyToken,upload.single('photo'),postStudent)
studentRoutes.put('/students/:id',verifyToken,upload.single('photo'),updateStudent)
studentRoutes.delete('/students/:id',verifyToken,deleteStudent)


export default studentRoutes