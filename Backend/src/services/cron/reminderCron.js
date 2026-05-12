import cron from "node-cron";
import Assignment from "../../models/assignment.Schema.js";
import User from "../../models/users.Schema.js";
import sendEmail from "../../utils/sendEmail.js";

cron.schedule("0 9,14,20 * * *", async () => {
    console.log("Running assignment reminder cron...");

    try {

        // get all assignments
        const assignments = await Assignment.find();

        for (const assignment of assignments) {

            // skip expired assignments
            if (new Date(assignment.deadline) < new Date()) {
                continue;
            }

            // all students
            const students = await User.find({ role: "student" });

            for (const student of students) {

                // check submitted or not
                const submitted = assignment.submissions.some(
                    sub => sub.student.toString() === student._id.toString()
                );

                // if not submitted send email
                if (!submitted) {

                    await sendEmail(
                        student.email,
                        `Reminder: ${assignment.title}`,
                        `
                        <h2>Assignment Reminder</h2>

                        <p>Hello ${student.fullname},</p>

                        <p>You have not submitted your assignment yet.</p>

                        <h3>${assignment.title}</h3>

                        <p>Deadline: ${assignment.deadline}</p>

                        <p>Please upload before deadline.</p>
                        `
                    );

                    console.log(`Reminder sent to ${student.email}`);
                }
            }
        }

    } catch (error) {
        console.log(error);
    }
});