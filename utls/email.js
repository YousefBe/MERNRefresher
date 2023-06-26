const nodemailer = require('nodemailer');

const sendEmail = async (options)=>{
    
    const transporter = nodemailer.createTransport({
        //lazem t48al fl gmail less scure app option
        // service: 'Gmail',
        // auth : {
        //     user: process.env.GMAIL_USER, 
        //     pass: process.env.PASSWORD
        // },
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth : {
            user: process.env.EMAIL_USER, 
            pass:  process.env.EMAIL_PASSWORD
        }

    })

    const mailOptions ={
            from :'Youssef Belal joebelal7@gmail.com',
            to: options.email,
            subject : options.subject,
            text: options.text
    }


    await transporter.sendMail(mailOptions)

}

module.exports = sendEmail