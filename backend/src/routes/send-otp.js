import twilio from "twilio";

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

export const sendOTPSMS = async (phone, otp) => {
    console.log("Sending OTP to:", phone);
    console.log("Using Twilio number:", process.env.TWILIO_PHONE_NUMBER);

    if (!phone) throw new Error("Phone number is required");

    try {
        const message = await client.messages.create({
            body: `Your OTP code is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone,
        });
        console.log("✅ OTP sent!", message.sid);
    } catch (error) {
        console.error("❌ Error sending OTP SMS:", error);
        throw error;
    }
};
