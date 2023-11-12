
# Track Your Emails

This project enables users to track access to specific images and generate tracking pixels. It features an administrative interface for viewing tracking data.

## Features

- **Image Tracking**: Allows users to upload images and receive a trackable link to use in their emails or websites.
- **Pixel Tracking Generation**: Users can generate an invisible tracking pixel to embed in emails to track opens.
- **Administrative Interface**: A web interface to view tracking statistics, including image opens and pixel tracking activity.

## Installation

To set up the project, you will need Node.js and npm installed on your machine. Once installed, clone the repository and install the dependencies:

```bash
git clone https://github.com/kangmartin/TrackYourMails.git
```
```bash
cd TrackYourEmails
```
```bash
npm install
```

## Dependencies

The project uses several npm dependencies, including:

- `express`: A web framework for Node.js.
- `multer`: A middleware for handling file uploads.
- `uuid`: For generating unique identifiers.

## Starting the Server

After installing the dependencies, you can start the server with:

```bash
node server.js
```

The server will start and be accessible at `http://localhost:3000`.

## Usage

- **For Image Tracking**: Go to `http://localhost:3000/upload.html` to upload an image and get its trackable link.
- **For Pixel Tracking Generation**: (Feature under development)
- **Administrative Interface**: Access `http://localhost:3000/tracking-data` to view tracking data.
