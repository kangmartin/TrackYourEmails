
# Track Your Emails

This project enables users to generate tracking pixels. It features an administrative interface for viewing tracking data.

## Features

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

