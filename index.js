import canvas from "canvas";
import * as faceapi from "face-api.js";
import express from "express";
import morgan from "morgan";

const { Canvas, Image, ImageData, loadImage } = canvas;
faceapi.env.monkeyPatch({ Canvas: Canvas, Image: Image, ImageData: ImageData });

await faceapi.nets.ssdMobilenetv1.loadFromDisk("./assets/tf-model");
await faceapi.nets.faceRecognitionNet.loadFromDisk("./assets/tf-model");
await faceapi.nets.faceLandmark68Net.loadFromDisk("./assets/tf-model");

const port = process.env.PORT ?? 3000;
console.log("models loaded");

const app = express();

app.use(morgan("combined"));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("node-facejs-api");
});

app.post("/match", async (req, res) => {
    const refImg = req.body.ref_img;
    const queryImg = req.body.query_img;

    console.log(refImg);
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    console.log(queryImg);

    const referenceImage = await loadImage(refImg);
    const queryImage = await loadImage(queryImg);

    //reference image
    const resultRefImg = await faceapi
        .detectAllFaces(referenceImage, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptors();

    //query image
    const resultQueryImg = await faceapi
        .detectAllFaces(queryImage, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptors();

    const faceMatcher = new faceapi.FaceMatcher(resultRefImg);

    const labels = faceMatcher.labeledDescriptors.map((ld) => ld.label);

    let bestMatch;
    resultQueryImg.forEach((res) => {
        bestMatch = faceMatcher.findBestMatch(res.descriptor);
    });

    return res.json({
        labels,
        match: { label: bestMatch.label, distance: bestMatch.distance },
    });
});

app.listen(port, () => {
    console.log(`server is running port: ${port}`);
});
