const messages = {
  ar: {
    // Auth & OTP
    otpMessage: "رمز التحقق الخاص بك هو: %s. صالح لمدة %d دقائق.",
    invalidOtp: "رمز التحقق غير صحيح أو منتهي الصلاحية",
    userCreated: "تم إنشاء الحساب بنجاح",
    otpSent: "تم إرسال رمز التحقق بنجاح",
    otpExpired: "انتهت صلاحية رمز التحقق",
    sendOtpFailed: "فشل في إرسال رمز التحقق",
    verificationFailed: "فشلت عملية التحقق",
    userNotFound: "لم يتم العثور على المستخدم",

    // Booking
    bookingCreated: "تم إنشاء الحجز بنجاح",
    bookingConfirmed: "تم تأكيد الحجز",
    bookingCancelled: "تم إلغاء الحجز",
    dateNotAvailable: "التاريخ المحدد غير متاح لهذه الخدمة",
    supplierLocked:
      "هذا المزود تجاوز الحد المجاني للحجوزات. يرجى الاشتراك لمواصلة استقبال الحجوزات",

    // Supplier Notifications
    bookingLimitWarning: "تنبيه: اقتربت من الحد المجاني للحجوزات (%d من 50)",
    bookingLimitReached:
      "تنبيه أخير: وصلت إلى الحد المجاني للحجوزات (50). تم إيقاف الحساب مؤقتًا",
    supplierUnlocked: "تم تفعيل حسابك بنجاح",

    // Join Requests
    joinRequestSubmitted: "تم تقديم طلب الانضمام بنجاح",
    joinRequestExists: "لديك طلب انضمام قيد المراجعة بالفعل",
    joinRequestApproved: "تم قبول طلب الانضمام وإنشاء حساب المزود",
    joinRequestRejected: "تم رفض طلب الانضمام",

    // Subscription
    subscriptionCreated: "تم تفعيل الاشتراك بنجاح",
    subscriptionFailed: "فشل في إنشاء الاشتراك",
    subscriptionNotFound: "لم يتم العثور على اشتراك نشط",
    subscriptionCancelled: "تم إلغاء الاشتراك بنجاح",
    subscriptionCancelFailed: "فشل في إلغاء الاشتراك",
    subscriptionRequired: "يجب الاشتراك لمواصلة استقبال الحجوزات",

    // Contact Messages
    contactInitiated: "تم إرسال طلب التواصل بنجاح",
    contactFailed: "فشل في إرسال طلب التواصل",
    invalidContactCategory: "هذه الخدمة لا تدعم التواصل المباشر",
    contactLimitWarning: "تنبيه: اقتربت من الحد المجاني للتواصلات (%d من 50)",
    contactLimitReached: "تنبيه: وصلت إلى الحد المجاني للتواصلات (50)",
    supplierLocked: "هذا المزود غير متاح حالياً. يرجى المحاولة لاحقاً",
  },
  en: {
    // Auth & OTP
    otpMessage: "Your verification code is: %s. Valid for %d minutes.",
    invalidOtp: "Invalid or expired OTP",
    userCreated: "Account created successfully",
    otpSent: "OTP sent successfully",
    otpExpired: "OTP has expired",
    sendOtpFailed: "Failed to send OTP",
    verificationFailed: "Verification failed",
    userNotFound: "User not found",

    // Booking
    bookingCreated: "Booking created successfully",
    bookingConfirmed: "Booking confirmed",
    bookingCancelled: "Booking cancelled",
    dateNotAvailable: "Selected date is not available for this service",
    supplierLocked:
      "This supplier has exceeded the free booking limit. Please subscribe to continue receiving bookings",

    // Supplier Notifications
    bookingLimitWarning: "Warning: Approaching free booking limit (%d of 50)",
    bookingLimitReached:
      "Final warning: Free booking limit (50) reached. Account temporarily locked",
    supplierUnlocked: "Your account has been activated successfully",

    // Join Requests
    joinRequestSubmitted: "Join request submitted successfully",
    joinRequestExists: "You already have a pending join request",
    joinRequestApproved: "Join request approved and supplier account created",
    joinRequestRejected: "Join request rejected",

    // Subscription
    subscriptionCreated: "Subscription activated successfully",
    subscriptionFailed: "Failed to create subscription",
    subscriptionNotFound: "No active subscription found",
    subscriptionCancelled: "Subscription cancelled successfully",
    subscriptionCancelFailed: "Failed to cancel subscription",
    subscriptionRequired:
      "Subscription required to continue receiving bookings",

    // Contact Messages
    contactInitiated: "Contact request sent successfully",
    contactFailed: "Failed to send contact request",
    invalidContactCategory: "This service doesn't support direct contact",
    contactLimitWarning: "Warning: Approaching free contact limit (%d of 50)",
    contactLimitReached: "Warning: Free contact limit reached (50)",
    supplierLocked:
      "This supplier is currently unavailable. Please try again later",
  },
};

const formatMessage = (key, lang = "ar", ...args) => {
  const template = messages[lang]?.[key] || messages.ar[key];
  if (!template) return key;
  return template.replace(/%s|%d/g, () => args.shift());
};

module.exports = { formatMessage };
