const { Router } = require('express');
const User = require('../model/user.schema');
const instructorRouter = Router();
const validateUserData = require('../utils/helper');
const bcrypt = require('bcrypt');
const { auth, RoleBased } = require('../middleware/auth');
const Course = require('../model/course.schema');
const upload = require('../middleware/upload');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const courseSchema = require('../model/course.schema');
const deleteFromCloudinary = require('../utils/deleteFromCloudinary');
const Enrollment = require('../model/enrollment.schema');
instructorRouter.post('/signup', async (req, res) => {
  try {
    validateUserData(req, res);
    const { firstName, lastName, email, password } = req.body;
    const isUserFound = await User.findOne({ email });
    if (isUserFound) {
      return res.status(400).json({ message: 'user already exist' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      role: 'instructor',
    });
    await user.save();

    return res.status(201).json({ message: 'User Registered Sucessfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
instructorRouter.post('/add/course',
  auth,
  RoleBased('instructor'),
  upload.fields([
    { name: 'coverPhoto', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { courseName, startDate, endDate, instructor, price, description } =
        req.body;
      if (!courseName) {
        return res.status(400).json({ message: 'course name requires' });
      }
      if (!price) {
        return res.status(400).json({ message: 'price required' });
      }
      if (!description) {
        return res.status(400).json({ message: 'description required' });
      }

      const coverResult = req.files.coverPhoto
        ? await uploadToCloudinary(
            req.files.coverPhoto[0].buffer,
            'course_covers',
          )
        : null;
      const thumbResult = req.files.thumbnail
        ? await uploadToCloudinary(
            req.files.thumbnail[0].buffer,
            'course_thumbnails',
          )
        : null;

      const course = new Course({
        courseName,
        price,
        description,
        startDate,
        endDate,
        instructor: req.user._id,
        coverPhoto: coverResult?.secure_url,
        coverPhotoPublicId: coverResult?.public_id,
        thumbnail: thumbResult?.secure_url,
        thumbnailPublicId: thumbResult?.public_id,
      });
      const savedCourse = await course.save();

      return res.status(200).json({ data: savedCourse });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);
instructorRouter.post('/course/:courseId/section/:sectionIndex/lesson/:lessonIndex/video',
  auth,
  RoleBased('instructor'),
  upload.single('video'),
  async (req, res) => {
    try {
      const { courseId, sectionIndex, lessonIndex } = req.params;
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: 'No video file provided' });
      }
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      const uploadResult = await uploadToCloudinary(
        file.buffer,
        'course_videos',
        'video',
      );
      if (!course.sections[sectionIndex]) {
        return res.status(400).json({ message: 'Section not found' });
      }
      if (!course.sections[sectionIndex].lessons[lessonIndex]) {
        return res.status(400).json({ message: 'lessson not found' });
      }
      course.sections[sectionIndex].lessons[lessonIndex].videoUrl =
        uploadResult.secure_url;
      course.sections[sectionIndex].lessons[lessonIndex].videoPublicId =
        uploadResult.public_id;
      await course.save();
      return res.status(200).json({
        message: 'Your video uploaded SuceessFully',
        videoUrl: uploadResult.secure_url,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);
instructorRouter.post('/course/:courseId/section/:sectionIndex/lesson/:lessonIndex/cheatsheet',
  auth,
  RoleBased('instructor'),
  async (req, res) => {
    try {
      const { courseId, sectionIndex, lessonIndex } = req.params;
      const { cheatSheetUrl } = req.body;
      if (!cheatSheetUrl) {
        return res
          .status(400)
          .json({ message: 'You didnt send cheat sheet link' });
      }
      const course = await Course.findById({ _id: courseId });
      if (!course) {
        return res.status(404).json({ message: 'course is not found' });
      }
      course.sections[sectionIndex].lessons[lessonIndex].cheatSheetUrl =
        cheatSheetUrl;
      await course.save();
      return res
        .status(200)
        .json({ message: 'cheat sheet added successfully' });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
);
instructorRouter.patch('/edit/course/:id',
  auth,
  RoleBased('instructor'),
  async (req, res) => {
    try {
      validateUserData.validateFileds(req, res);
      const { courseName, startDate, endDate, instructor, price, description } =
        req.body;
      const { id } = req.params;
      const currentInstructor = req.user;
      const course = await Course.findOne({
        instructor: currentInstructor._id,
        _id: id,
      });
      if (!course) {
        return res.status(404).json({ message: 'np courses found' });
      }
      if (courseName != null) {
        course.courseName = courseName;
      }
      if (price != null) {
        course.price = price;
      }
      if (description != null) {
        course.description = description;
      }

      if (startDate != null) {
        course.startDate = startDate;
      }
      if (endDate != null) {
        course.endDate = endDate;
      }
      const updatedCourse = await course.save();
      return res.status(200).json({ data: { updatedCourse } });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
);

instructorRouter.get('/my-courses',auth,RoleBased('instructor'),async (req, res) => {
    try {
      const currentUser = req.user;
      const courses = await Course.find({ instructor: currentUser._id });
      if (courses.length === 0) {
        return res.status(404).json({ message: 'no courses' });
      }
      return res.status(200).json({ data: courses });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
);

instructorRouter.post('/:courseId/section',
  auth,
  RoleBased('instructor'),
  async (req, res) => {
    try {
      const { courseId } = req.params;
      const { title } = req.body;

      if (!title) {
        return res.status(400).json({ message: 'Section title is required' });
      }

      const course = await Course.findOne({
        _id: courseId,
        instructor: req.user._id,
      });
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      course.sections.push({ title, lessons: [] });
      await course.save();

      return res.status(201).json({
        message: 'Section added successfully',
        sections: course.sections,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
);
instructorRouter.post('/:courseId/section/:sectionIndex/lesson',
  auth,
  RoleBased('instructor'),
  async (req, res) => {
    try {
      const { courseId, sectionIndex } = req.params;
      const { title, cheatSheetUrl } = req.body;
      const course = await Course.findOne({
        _id: courseId,
        instructor: req.user._id,
      });
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      if (!course.sections[sectionIndex]) {
        return res.status(400).json({ message: 'Section not found' });
      }
      const newLesson = {
        title,
        cheatSheetUrl: cheatSheetUrl || '',
        videoUrl: '',
      };
      course.sections[sectionIndex].lessons.push(newLesson);
      await course.save();

      return res.status(201).json({
        message: 'Lesson added successfully',
        course,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
);
instructorRouter.delete('/:courseId/section/:sectionIndex',
  auth,
  RoleBased('instructor'),
  async (req, res) => {
    try {
      const { courseId, sectionIndex } = req.params;

      const course = await Course.findOne({
        _id: courseId,
        instructor: req.user._id,
      });
      if (!course) return res.status(404).json({ message: 'Course not found' });

      if (!course.sections[sectionIndex])
        return res.status(404).json({ message: 'Section not found' });
      course.sections.splice(sectionIndex, 1);
      await course.save();

      return res.status(200).json({
        message: 'Section deleted successfully',
        sections: course.sections,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
);
instructorRouter.delete('/:courseId/section/:sectionIndex/lesson/:lessonIndex',
  auth,
  RoleBased('instructor'),
  async (req, res) => {
    try {
      const { courseId, sectionIndex, lessonIndex } = req.params;

      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ message: 'Course not found' });

      if (!course.sections[sectionIndex])
        return res.status(404).json({ message: 'Section not found' });

      if (!course.sections[sectionIndex].lessons[lessonIndex])
        return res.status(404).json({ message: 'Lesson not found' });

      course.sections[sectionIndex].lessons.splice(lessonIndex, 1);
      await course.save();

      return res.status(200).json({ message: 'Lesson deleted successfully' });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
);
instructorRouter.get('/:courseId/section/:sectionIndex/lesson/:lessonIndex',
  auth,
  RoleBased('instructor', 'student'),
  async (req, res) => {
    try {
      const { courseId, sectionIndex, lessonIndex } = req.params;
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'course not found' });
      }
      if (!course.sections[sectionIndex])
        return res.status(404).json({ message: 'Section not found' });

      if (!course.sections[sectionIndex].lessons[lessonIndex])
        return res.status(404).json({ message: 'Lesson not found' });

      return res
        .status(200)
        .json({ data: course.sections[sectionIndex].lessons[lessonIndex] });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
);
instructorRouter.get('/:courseId/section/:sectionIndex/lesson/:lessonIndex/cheatsheet',
  auth,
  RoleBased('instructor', 'student'),
  async (req, res) => {
    try {
      const { courseId, sectionIndex, lessonIndex } = req.params;
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'course not found' });
      }
      if (!course.sections[sectionIndex])
        return res.status(404).json({ message: 'Section not found' });

      if (!course.sections[sectionIndex].lessons[lessonIndex])
        return res.status(404).json({ message: 'Lesson not found' });

      return res.status(200).json({
        data: course.sections[sectionIndex].lessons[lessonIndex].cheatSheetUrl,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
);
instructorRouter.get('/:courseId/sections',
  auth,
  RoleBased('instructor'),
  async (req, res) => {
    try {
      const { courseId } = req.params;
      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ message: 'Course not found' });

      return res.status(200).json({ data: course.sections });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
);
instructorRouter.delete('/delete/:courseId',
  auth,
  RoleBased('instructor'),
  async (req, res) => {
    try {
      const { courseId } = req.params;
      const course = await Course.findOne({
        _id: courseId,
        instructor: req.user._id,
      });
      if (!course) {
        return res
          .status(404)
          .json({ message: 'Course not found or not owned by you' });
      }

      if (course.coverPhotoPublicId)
        await deleteFromCloudinary(course.coverPhotoPublicId, 'image');

      if (course.thumbnailPublicId)
        await deleteFromCloudinary(course.thumbnailPublicId, 'image');

      for (const section of course.sections) {
        for (const lesson of section.lessons) {
          if (lesson.videoPublicId)
            await deleteFromCloudinary(lesson.videoPublicId, 'video');
          if (lesson.cheatSheetPublicId)
            await deleteFromCloudinary(lesson.cheatSheetPublicId, 'raw');
        }
      }
      await course.deleteOne({ _id: courseId });
      return res.status(200).json({ message: 'course deleted suceesssfully' });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
);
instructorRouter.delete('/delete/:courseId/section/:sectionIndex',
  auth,
  RoleBased('instructor'),
  async (req, res) => {
    try {
      const { courseId, sectionIndex } = req.params;
      const course = await Course.findOne({
        _id: courseId,
        instructor: req.user._id,
      });
      if (!course) {
        return res
          .status(404)
          .json({ message: 'Course not found or not owned by you' });
      }
      if (!course.sections[sectionIndex]) {
        return res.status(404).json({ message: 'section not found' });
      }
      for (const lesson of course.sections[sectionIndex].lessons) {
        if (lesson.videoPublicId) {
          await deleteFromCloudinary(lesson.videoPublicId, 'video');
        }
        if (lesson.cheatSheetPublicId) {
          await deleteFromCloudinary(lesson.cheatSheetPublicId, 'raw');
        }
      }
      course.sections.splice(sectionIndex, 1);
      return res.status(200).json({ message: 'section deleted suceesssfully' });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
);
instructorRouter.get('/profile',
  auth,
  RoleBased('instructor'),
  async (req, res) => {
    try {
      return res.status(200).json({ data: req.user });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
);
instructorRouter.get('/dashboard',auth,
  RoleBased('instructor'),
  async (req, res) => {
    try {
      const enrollements = await Enrollment.find({
        instructorID: req.user._id,
        status: 'completed',
      });

      const totalStudents = new Set(
        enrollements.map(item => item.studentId),
      ).size();
      const totalEarnings = enrollements.reduce(
        (sum, enroll) => sum + (enroll.amount || 0),
        0,
      );
      const totalCourses = await Course.countDocuments({
        instructor: req.user._id,
      });

      return res.status(200).json({
        data: {
          totalCourses,
          totalStudents,
          totalEarnings,
        },
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
);


module.exports = instructorRouter;
