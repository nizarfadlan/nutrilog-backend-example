import express from 'express';
import * as path from 'path';
import * as tf from '@tensorflow/tfjs-node';
import multer from 'multer';
import * as fs from 'fs/promises';
import type { Request, Response } from 'express';

const app = express();
const port = 3000;

let model: tf.LayersModel | null = null;

const loadModel = async () => {
  try {
    const handler = tf.io.fileSystem('./models/model.json');
    model = await tf.loadLayersModel(handler);
    console.log('Model loaded successfully');
  } catch (error) {
    console.error('Error loading model:', error);
  }
};

app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.send('Hello Worl!');
});

const upload = multer({ dest: 'uploads/' });

app.post('/predict', upload.single('image'), async (req: Request, res: Response) => {
  if (!model) {
    return res.status(500).send('Model not loaded');
  }

  const filePath = req.file?.path;
  if (!filePath) {
    return res.status(400).send('No file uploaded');
  }

  try {
    const imageBuffer = await fs.readFile(filePath);
    const imageTensor = tf.node.decodeImage(imageBuffer)
      .resizeNearestNeighbor([224, 224]) // Resize to the required size
      .toFloat()
      .div(tf.scalar(255.0)) // Normalize to [0, 1]
      .expandDims(); // Add batch dimension

    const prediction = model.predict(imageTensor) as tf.Tensor;
    const result = prediction.arraySync();

    await fs.unlink(filePath);
    res.json(result);
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Error processing image');
  }
});

app.listen(port, () => {
  loadModel();
  return console.log(`http://localhost:${port}`);
});
