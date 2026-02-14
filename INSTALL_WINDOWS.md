# How to Run StreamBox on Windows (Zero to Hero Guide)

Follow these steps exactly to run StreamBox on any Windows computer.

---

## **Part 1: Install Software**
Your friend's computer needs **Node.js** to understand the code.

1.  **Download Node.js**:
    *   Go to: [https://nodejs.org/](https://nodejs.org/)
    *   Download the green button that says **"LTS Recommended For Most Users"**.
2.  **Install It**:
    *   Open the downloaded file.
    *   Click `Next`, `I Agree`, `Next`... just keep clicking **Next** until it's done.
    *   *Note: You do NOT need to check the box for "Chocolatey" or "Tools". Just the standard install is fine.*

---

## **Part 2: Prepare the Folder**
1.  **Copy the Folder**:
    *   Takes the `StreamBox` folder from your Mac and put it on their Windows Desktop.
2.  **Clean It Up** (Important!):
    *   Open the `StreamBox` folder.
    *   **DELETE** the folder named `node_modules` if you see it.
    *   *(Why? Because the Mac `node_modules` files won't work on Windows. We will re-download the correct ones in the next step.)*

---

## **Part 3: Run the Commands**
Now we use the "Command Prompt" to start the app.

1.  **Open Command Prompt**:
    *   Press the `Windows Key` on the keyboard.
    *   Type `cmd` and press **Enter**.
    *   A black window will appear.

2.  **Go to the Folder**:
    *   Type this command and press **Enter** (replace `User` with their actual username):
        ```bash
        cd Desktop\StreamBox
        ```
    *   *Tip: You can usually type `cd Desktop\` then press Tab to auto-complete.*

3.  **Install Dependencies** (Only do this once):
    *   Type this and press **Enter**:
        ```bash
        npm install
        ```
    *   *Wait for it to finish. You might see some warnings (yellow text), that is normal. Wait for it to stop moving.*

4.  **Start the App**:
    *   Type this and press **Enter**:
        ```bash
        npm run dev
        ```
    *   The app should launch in its own window!

---

## **Troubleshooting**
*   **"npm is not recognized"**: They didn't install Node.js correctly. Restart the computer and try Part 1 again.
*   **"Missing Script: dev"**: You are in the wrong folder. Make sure you did the `cd` step correctly.
*   **White Screen**: Press `Ctrl + R` while in the app to force a reload.
