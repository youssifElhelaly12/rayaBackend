let qr = require('qrcode')

let data = {
    eventId : 4,
    userId:2
}

let dataString = JSON.stringify(data)

async function generateQRCode() {
    let qrCode = await qr.toString(dataString)
    console.log(qrCode)
}
generateQRCode()
