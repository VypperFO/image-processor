import express, {Express, Request, Response} from "express";
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
const upload = multer({storage: storage});

app.post(
  "/api/resize",
  upload.single("image"),
	async function (req: Request, res: Response) {
    if (req.file) {
      try {
        const backgroudColor = { r: 0, g: 0, b: 0, alpha: 0 };
        const margin = 0;

        const resizedImageBuffer = await sharp(req.file.buffer)
          .resize({
            width: 1600,
            height: 2200,
            fit: sharp.fit.contain,
            background: backgroudColor,
          })
          .extend({
            left: margin,
            right: margin,
            background: backgroudColor,
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
      res.status(400).json({message: "No file uploaded"});
    }
  }
);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
