# LabelFlow

Create and print professional barcode labels with custom sizes and templates.

## Features

- Generate barcode labels with product information
- Multiple preset label sizes (38mm × 25mm, 50mm × 25mm, etc.)
- Custom label size support
- Multi-column printing layouts
- Save and load templates to Firebase
- Real-time preview with zoom controls
- Print multiple labels at once

## Development

**Use your preferred IDE**

Clone this repo and start developing:

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository
git clone https://github.com/ClancodeLabs/rapid-print-labels.git

# Step 2: Navigate to the project directory
cd rapid-print-labels

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

## Technologies

This project is built with:

- **Vite** - Fast build tool
- **TypeScript** - Type safety
- **React** - UI framework
- **shadcn-ui** - Component library
- **Tailwind CSS** - Styling
- **Firebase Firestore** - Cloud database for templates
- **JsBarcode** - Barcode generation

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firestore Database
3. Update the Firebase config in `src/lib/firebase.ts`
4. Set Firestore security rules to allow read/write access

## Build for Production

```sh
npm run build
```

The build output will be in the `dist` directory.
