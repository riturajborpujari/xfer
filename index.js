const fs = require("fs");
const os = require("os");
const path = require("path");
const multer = require("multer");
const qrcode = require("qrcode");
const express = require("express");

const UPLOAD_DIR = "uploads/";
const upload = multer({ dest: UPLOAD_DIR });
const HTTP_PORT = 8080;

const app = express();

app.get("/", (_, res) => {
	res.send(`
		<body style="font-size: 18pt; background-color: #181818; color: #efefef; display: flex; justify-content: center; align-items: center; height: 100vh;">
			<form action="/files" method="post" enctype="multipart/form-data" style="box-shadow: 0 0 1px #666; padding: 16px;">
			<input type="file" name="file"/>
			<input type="submit" value="Upload file"/>
			</form>
		</body>
	`);

	res.end();
});

app.post("/files", upload.single("file"), (req, res) => {
	const destpath = path.join(UPLOAD_DIR, req.file.originalname);
	fs.copyFileSync(req.file.path, destpath);
	fs.unlinkSync(req.file.path);

	console.log("File received:", destpath);

	res.status(201).end("File Accepted");
});

app.listen(HTTP_PORT, () => {
	console.log("INFO: File server started");
	const interfaces = os.networkInterfaces();
	delete interfaces.lo;

	Object.entries(interfaces).forEach(([_, list]) => {
		const entry = list.find((el) => el.family === "IPv4");

		const url = `http://${entry.address}:${HTTP_PORT}`;
		console.log(url);
		qrcode.toString(url, { type: "terminal" }, (_, encoded_url) => {
			console.log(encoded_url);
		});
	});
});
