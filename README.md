# Online Ticket Booking Platform - Server

## Purpose
Backend API for the Online Ticket Booking Platform. Built with Express.js, MongoDB, and BetterAuth for authentication.

## Live URL
https://ticketbari-server-ym3o.onrender.com/

## Key Features
- BetterAuth authentication (email/password + Google OAuth)
- JWT-based session management
- Role-based access control (User, Vendor, Admin)
- CRUD operations for tickets, bookings, payments
- Stripe payment integration
- Image upload via imgBB
- Search, filter, sort, and pagination for tickets

## NPM Packages Used
- express - Web framework
- mongoose - MongoDB ODM
- better-auth - Authentication library
- stripe - Payment processing
- cors - Cross-Origin Resource Sharing
- dotenv - Environment variable management
- mongodb - MongoDB driver for BetterAuth
