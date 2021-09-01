// import "@tensorflow/tfjs-node";
import * as fs from "fs";
import * as path from "path";
import canvas from "canvas";
import * as faceapi from "face-api.js";
import express from "express";
import morgan from "morgan";

const app = express();

const { Canvas, Image, ImageData, loadImage } = canvas;
faceapi.env.monkeyPatch({ Canvas: Canvas, Image: Image, ImageData: ImageData });

const baseDir = path.resolve("./", "./out");

export function saveFile(fileName, buf) {
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir);
  }

  fs.writeFileSync(path.resolve(baseDir, fileName), buf);
}

await faceapi.nets.ssdMobilenetv1.loadFromDisk("./assets/tf-model");
await faceapi.nets.faceRecognitionNet.loadFromDisk("./assets/tf-model");
await faceapi.nets.faceLandmark68Net.loadFromDisk("./assets/tf-model");

console.log("models loaded");
app.use(morgan("combined"));

app.get("/match", async (req, res) => {
  const referenceImage = await loadImage("./assets/images/me/meRef.jpeg");
  const queryImage = await loadImage("./assets/images/angry.jpg");

  // analyise reference image
  const resultsRef = await faceapi
    .detectAllFaces(referenceImage, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptors();

  // analyise query image
  const resultsQuery = await faceapi
    .detectAllFaces(queryImage, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptors();

  const faceMatcher = new faceapi.FaceMatcher(resultsRef);

  const labels = faceMatcher.labeledDescriptors.map((ld) => ld.label);
  console.log("ref iamge labels", labels);

  let bestMatch;
  resultsQuery.forEach((res) => {
    bestMatch = faceMatcher.findBestMatch(res.descriptor);
  });

  //   const refDrawBoxes = resultsRef
  //     .map((res) => res.detection.box)
  //     .map((box, i) => new faceapi.draw.DrawBox(box, { label: labels[i] }));
  //   const outRef = faceapi.createCanvasFromMedia(referenceImage);
  //   refDrawBoxes.forEach((drawBox) => drawBox.draw(outRef));

  //   saveFile("referenceImage.jpg", outRef.toBuffer("image/jpeg"));

  //   const queryDrawBoxes = resultsQuery.map((res) => {
  //     const bestMatch = faceMatcher.findBestMatch(res.descriptor);
  //     console.log(bestMatch);
  //     return new faceapi.draw.DrawBox(res.detection.box, { label: bestMatch.toString() });
  //   });
  //   const outQuery = faceapi.createCanvasFromMedia(queryImage);
  //   queryDrawBoxes.forEach((drawBox) => drawBox.draw(outQuery));
  //   saveFile("queryImage.jpg", outQuery.toBuffer("image/jpeg"));
  //   console.log("done, saved results to out/queryImage.jpg");
  //   resultsRef, resultsQuery,

  res.json({
    isMatch: labels.includes(bestMatch.label),
    distance: labels.includes(bestMatch.label) ? bestMatch.distance : 0,
  });
});

const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  console.log(`server is running port: ${port}`);
});
