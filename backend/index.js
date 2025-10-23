// index.js
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./src/routes/auth.routes.js";

dotenv.config();
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* ------------------- Serialize / Deserialize ------------------- */
passport.serializeUser((user, done) => done(null, user.user_id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { user_id: id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

/* ------------------- GOOGLE STRATEGY ------------------- */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        `${process.env.BACKEND_URL || "http://localhost:5000"}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email found"), null);

        // Check user
        let user = await prisma.user.findUnique({ where: { email } });

        // Create if not exist
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              full_name: profile.displayName || email,
              googleId: profile.id,
              password_hash: Math.random().toString(36).slice(2),
            },
          });
        } else if (!user.googleId) {
          // Update googleId if user existed before
          user = await prisma.user.update({
            where: { email },
            data: { googleId: profile.id },
          });
        }

        return done(null, user);
      } catch (err) {
        console.error("Google auth error:", err);
        return done(err, null);
      }
    }
  )
);

/* ------------------- FACEBOOK STRATEGY ------------------- */
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: "https://ayako-nonliquidating-positivistically.ngrok-free.dev/api/auth/facebook/callback",
      profileFields: ["id", "emails", "name", "picture.type(large)"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email found"), null);

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              full_name: profile.displayName || email,
              facebookId: profile.id,
              password_hash: Math.random().toString(36).slice(2),
            },
          });
        } else if (!user.facebookId) {
          user = await prisma.user.update({
            where: { email },
            data: { facebookId: profile.id },
          });
        }

        return done(null, user);
      } catch (err) {
        console.error("Facebook auth error:", err);
        return done(err, null);
      }
    }
  )
);

/* ------------------- AUTH ROUTES ------------------- */
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: true }),
  (req, res) => {
    const email = req.user.email;
    res.redirect(`http://localhost:3000?email=${email}`);
  }
);

app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));

app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/", session: true }),
  (req, res) => {
    const email = req.user.email;
    res.redirect(`http://localhost:3000?email=${email}`);
  }
);

/* ------------------- API ROUTES ------------------- */
app.use("/api/auth", authRoutes);

/* ------------------- TEST ------------------- */
app.get("/", (req, res) => res.send("Hello from PetCare backend"));

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
