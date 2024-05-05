import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import multer from "multer";
import sharp from "sharp";
import cors from "cors";

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post(
  "/api/resize",
  upload.single("image"),
  async function (req: Request, res: Response) {
    if (req.file) {
      try {
        // extract first pixel color
        const image = sharp(req.file.buffer);
        const { data } = await image
          .raw()
          .toBuffer({ resolveWithObject: true });
        let backgroundColor = {
          r: data[0],
          g: data[1],
          b: data[2],
          alpha: data[3] / 255,
        };

        // if transparent
        if (backgroundColor.alpha === 0) {
          backgroundColor = { r: 255, g: 255, b: 255, alpha: 1 };
        }

        const margin = 0;

        const resizedImageBuffer = await sharp(req.file.buffer)
          .resize({
            width: 1600,
            height: 2200,
            fit: sharp.fit.contain,
            background: backgroundColor,
          })
          .extend({
            left: margin,
            right: margin,
            background: backgroundColor,
          })
          .png()
          .toBuffer();

        res.type("png");
        res.send(resizedImageBuffer);
      } catch (error: any) {
        res.status(500).json({
          message: "Failed to process image",
          error: error.message,
        });
      }
    } else {
      res.status(400).json({ message: "No file uploaded" });
    }
  }
);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
