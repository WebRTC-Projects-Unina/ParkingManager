# DI.P.S PARKING MANAGER

This project allows one or more administrators to manage a multi-access parking lot and provides one or more users the ability to contact administrators in case of any issues.

## Implementation - Admin Side

### Login Page
Each admin must first authenticate through a dedicated login page by providing an appropriate username and password.

### Dashboard
Once logged in successfully, the admin can:
- 
- Monitor the parking lot from two different angles using the two installed cameras.
- Update the number of available parking spots in real time.
- Open/close each entry/exit by interacting with buttons.
- Manage assistance chats with users.

### Assistance Chat
When a user requests assistance, an entry will appear at the bottom of the dashboard, showing the socket ID associated with the created chat and the name of the room. If the admin wants to respond to the assistance request, they can click the corresponding button to open a pop-up window and chat with the user in need.

## Implementation - User Side

### Customer Service
From the same login page as the admin, the user can request assistance by interacting with a button at the top right. After doing so, the user will be redirected to a screen where they can make a choice:

- Communicate with an admin via chat.
- Call an admin directly.

### Assistance Chat
If the user chooses to communicate via chat, they will be redirected to a window where they must enter their username and the room name.

### Call
If the user wants to call an admin, another window will open with a short tutorial that the user must follow.

## Technologies Used

- **Node.js**: Version 20.18.0
- **Flask**: Version 3.1.0
- **MongoDB**: Version 2.3.4
- **React**: Version 10.8.2
- **FreeSWITCH**
- **Zoiper**
- **ESP32-CAM-MB**

