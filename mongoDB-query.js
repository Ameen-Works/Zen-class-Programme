db = connect("mongodb://localhost/Zen_class_program");
// Create collections
db.createCollection("users");
db.createCollection("codekata");
db.createCollection("attendance");
db.createCollection("topics");
db.createCollection("tasks");
db.createCollection("company_drives");
db.createCollection("mentors");

// Insert sample data for users
for (let i = 1; i <= 20; i++) {
  db.users.insert({
    user_id: i,
    username: `user${i}`,
    mentor_id: i <= 15 ? 101 : i <= 18 ? 102 : 103,
  });
}

// Insert sample data for codekata
for (let i = 1; i <= 20; i++) {
  db.codekata.insert({
    user_id: i,
    problems_solved: Math.floor(Math.random() * 100),
  });
}

// Insert sample data for attendance
for (let i = 1; i <= 20; i++) {
  db.attendance.insert({
    user_id: i,
    date: new Date(),
    attended: i % 2 === 0 ? true : false,
  });
}

// Insert sample data for topics
db.topics.insertMany([
  {
    topic_id: 101,
    topic_name: "Topic 1",
    date: ISODate("2022-09-01"),
  },
  {
    topic_id: 102,
    topic_name: "Topic 2",
    date: ISODate("2022-10-01"),
  },
  {
    topic_id: 103,
    topic_name: "Topic 3",
    date: ISODate("2022-10-15"),
  },
]);

// Insert sample data for tasks
db.tasks.insertMany([
  {
    task_id: 1,
    topic_id: 101,
    user_id: 1,
    task_name: "Task 1",
    submitted: true,
  },
  {
    task_id: 1,
    topic_id: 102,
    user_id: 2,
    task_name: "Task 2",
    submitted: false,
  },
  {
    task_id: 1,
    topic_id: 103,
    user_id: 3,
    task_name: "Task 3",
    submitted: true,
  },
  {
    task_id: 2,
    topic_id: 101,
    user_id: 1,
    task_name: "Task 1",
    submitted: true,
  },
  {
    task_id: 2,
    topic_id: 102,
    user_id: 2,
    task_name: "Task 2",
    submitted: false,
  },
  {
    task_id: 2,
    topic_id: 103,
    user_id: 3,
    task_name: "Task 3",
    submitted: true,
  },
]);

// Insert sample data for company_drives
db.company_drives.insertMany([
  {
    drive_id: 1,
    drive_name: "Company Drive 1",
    date: ISODate("2022-10-20"),
  },
  {
    drive_id: 2,
    drive_name: "Company Drive 2",
    date: ISODate("2022-11-05"),
  },
  {
    drive_id: 3,
    drive_name: "Company Drive 3",
    date: ISODate("2022-10-25"),
  },
  {
    drive_id: 4,
    drive_name: "Company Drive 4",
    date: ISODate("2022-10-15"),
  },
  {
    drive_id: 5,
    drive_name: "Company Drive 5",
    date: ISODate("2022-11-10"),
  },
  {
    drive_id: 6,
    drive_name: "Company Drive 6",
    date: ISODate("2022-10-30"),
  },
]);

// Insert sample data for mentors
db.mentors.insertMany([
  {
    mentor_id: 101,
    mentor_name: "Mentor 1",
    mentees: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  },
  {
    mentor_id: 102,
    mentor_name: "Mentor 2",
    mentees: [16, 17, 18],
  },
  {
    mentor_id: 103,
    mentor_name: "Mentor 3",
    mentees: [19, 20],
  },
]);

//1. Find all the topics and tasks which are taught in the month of October:

db.topics.aggregate([
  {
    $match: {
      date: {
        $gte: ISODate("2020-10-01"),
        $lte: ISODate("2020-10-31"),
      },
    },
  },
  {
    $lookup: {
      from: "tasks",
      localField: "topic_id",
      foreignField: "topic_id",
      as: "tasks_taught",
    },
  },
]);

//2. Find all the company drives which appeared between 15 Oct 2020 and 31 Oct 2020:

db.company_drives.find({
  date: {
    $gte: ISODate("2020-10-15"),
    $lte: ISODate("2020-10-31"),
  },
});

//3. Find all the company drives and students who appeared for the placement:

db.company_drives.aggregate([
  {
    $lookup: {
      from: "attendance",
      localField: "drive_id",
      foreignField: "drive_id",
      as: "attendance",
    },
  },
  {
    $match: {
      "attendance.appeared": true,
    },
  },
]);

//4. Find the number of problems solved by the user in codekata:

db.codekata.aggregate([
  {
    $match: {
      user_id: "user_id_here",
    },
  },
  {
    $group: {
      _id: "$user_id",
      problemsSolved: { $sum: 1 },
    },
  },
]);

//5. Find all the mentors with mentee's count more than 15:

db.mentors.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "mentor_id",
      foreignField: "mentor_id",
      as: "mentees",
    },
  },
  {
    $addFields: {
      menteesCount: { $size: "$mentees" },
    },
  },
  {
    $match: {
      menteesCount: { $gt: 15 },
    },
  },
]);

//6. Find the number of users who are absent and task is not submitted between 15 Oct 2020 and 31 Oct 2020:

db.attendance.aggregate([
  {
    $match: {
      date: {
        $gte: ISODate("2020-10-15"),
        $lte: ISODate("2020-10-31"),
      },
      attended: false,
    },
  },
  {
    $lookup: {
      from: "tasks",
      localField: "user_id",
      foreignField: "user_id",
      as: "tasks",
    },
  },
  {
    $match: {
      "tasks.submitted": false,
    },
  },
  {
    $group: {
      _id: null,
      absentUsersCount: { $sum: 1 },
    },
  },
]);
