import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

passport.serializeUser((user, done) => done(null, user.user_id));

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { user_id: id } });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// --- GOOGLE OAUTH ---
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:5000/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const googleId = profile.id;
                const email = profile.emails?.[0]?.value;

                let user = await prisma.user.findUnique({ where: { googleId } });

                if (!user && email) {
                    user = await prisma.user.findUnique({ where: { email } });
                }

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            full_name: profile.displayName || email || "Google User",
                            email,
                            googleId,
                            password_hash: null,
                        },
                    });
                } else if (!user.googleId) {
                    user = await prisma.user.update({
                        where: { user_id: user.user_id },
                        data: { googleId },
                    });
                }

                return done(null, user);
            } catch (err) {
                console.error("Google OAuth error:", err);
                return done(err, null);
            }
        }
    )
);

// --- FACEBOOK OAUTH ---
passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/facebook/callback`,
            profileFields: ["id", "displayName", "emails"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const facebookId = profile.id;
                const email = profile.emails?.[0]?.value;

                // 🔍 Tìm user theo facebookId
                let user = await prisma.user.findUnique({ where: { facebookId } });

                // Nếu chưa có, thử theo email
                if (!user && email) {
                    user = await prisma.user.findUnique({ where: { email } });
                }

                // Nếu chưa có -> tạo mới
                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            full_name: profile.displayName || email || "Facebook User",
                            email,
                            facebookId,
                            password_hash: null,
                        },
                    });
                }
                // Nếu có user nhưng chưa lưu facebookId → cập nhật
                else if (!user.facebookId) {
                    user = await prisma.user.update({
                        where: { user_id: user.user_id },
                        data: { facebookId },
                    });
                }

                return done(null, user);
            } catch (err) {
                console.error("Facebook OAuth error:", err);
                return done(err, null);
            }
        }
    )
);

export default passport;
