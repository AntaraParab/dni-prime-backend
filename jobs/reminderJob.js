const cron = require("node-cron");
const nodemailer = require("nodemailer");
const Vehicle = require("../models/Vehicle");
const ServiceRecord = require("../models/ServiceRecord");
const PucCertificate = require("../models/PucCertificate");
const User = require("../models/User");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendReminderEmail(to, subject, message) {
  try {
    await transporter.sendMail({
      from: `"DNI Prime Alerts" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: message,
    });
    console.log(`Reminder email sent to ${to}`);
  } catch (err) {
    console.log("Email send error:", err.message);
  }
}

const SERVICE_INTERVAL_MONTHS = 6;

async function checkPucReminders(today, sevenDaysLater) {
  const expiringCerts = await PucCertificate.find({
    expiryDate: { $gte: today, $lte: sevenDaysLater },
  }).populate("vehicle");

  for (const cert of expiringCerts) {
    const vehicle = cert.vehicle;
    if (!vehicle) continue;
    const user = await User.findById(vehicle.owner);
    if (!user) continue;

    const daysLeft = Math.ceil((cert.expiryDate - today) / (1000 * 60 * 60 * 24));
    await sendReminderEmail(
      user.email,
      `PUC Expiring Soon - ${vehicle.regNo}`,
      `Hi ${user.name},\n\nYour vehicle ${vehicle.regNo} (${vehicle.model}) has a PUC certificate expiring in ${daysLeft} day(s) on ${cert.expiryDate.toDateString()}.\n\nPlease renew it soon.\n\n- DNI Prime`
    );
  }
}

async function checkServiceDueReminders(today, sevenDaysLater) {
  const vehicles = await Vehicle.find({});

  for (const vehicle of vehicles) {
    const lastService = await ServiceRecord.findOne({ vehicle: vehicle._id }).sort({ serviceDate: -1 });
    if (!lastService) continue;

    const dueDate = new Date(lastService.serviceDate);
    dueDate.setMonth(dueDate.getMonth() + SERVICE_INTERVAL_MONTHS);

    if (dueDate >= today && dueDate <= sevenDaysLater) {
      const user = await User.findById(vehicle.owner);
      if (!user) continue;

      const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      await sendReminderEmail(
        user.email,
        `Service Due Soon - ${vehicle.regNo}`,
        `Hi ${user.name},\n\nYour vehicle ${vehicle.regNo} (${vehicle.model}) is due for service in ${daysLeft} day(s) (last serviced on ${lastService.serviceDate.toDateString()}).\n\nPlease book a service soon.\n\n- DNI Prime`
      );
    }
  }
}

async function checkReminders() {
  console.log("Running daily reminder check...");
  const today = new Date();
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(today.getDate() + 7);

  await checkPucReminders(today, sevenDaysLater);
  await checkServiceDueReminders(today, sevenDaysLater);
}

// Runs every day at

function startReminderJob() {
cron.schedule("0 8 * * *", checkReminders);
  console.log("Reminder job scheduled ✅");
}

module.exports = startReminderJob;