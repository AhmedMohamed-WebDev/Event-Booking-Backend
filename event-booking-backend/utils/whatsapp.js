// utils/whatsapp.js

const sendWhatsAppNotification = async (phoneNumber, message) => {
  console.log(`📲 Sending WhatsApp message to ${phoneNumber}:`);
  console.log(`   "${message}"`);
  // 🔒 Real integration with Twilio/360Dialog would go here
};

module.exports = sendWhatsAppNotification;
