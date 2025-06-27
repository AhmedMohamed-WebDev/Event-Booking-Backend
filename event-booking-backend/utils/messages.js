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
    subscriptionExpiring: "تنبيه: سينتهي اشتراكك خلال %d أيام",
    subscriptionRenewed: "تم تجديد اشتراكك تلقائياً",
    subscriptionLimitNear: "تنبيه: استخدمت %d%% من حد التواصل المسموح به",
    subscriptionExpired: "انتهى اشتراكك. يرجى التجديد للاستمرار",

    // Contact Limit
    contactLimitWarning:
      "تنبيه: باقي لك {0} اتصال فقط قبل الوصول للحد المجاني. يرجى الاشتراك لمواصلة استقبال الاتصالات.",
    contactLimitReached:
      "تم الوصول للحد المجاني للاتصالات (50). تم إيقاف الحساب مؤقتًا. يرجى الاشتراك لمواصلة العمل.",
    subscriptionRequired:
      "يجب الاشتراك لمواصلة استقبال الاتصالات. الحد المجاني هو 50 اتصال.",
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
    subscriptionExpiring: "Alert: Your subscription expires in %d days",
    subscriptionRenewed: "Your subscription has been automatically renewed",
    subscriptionLimitNear: "Warning: You've used %d%% of your contact limit",
    subscriptionExpired:
      "Your subscription has expired. Please renew to continue",

    // Contact Limit
    contactLimitWarning:
      "Warning: You have {0} contacts remaining before reaching the free limit. Please subscribe to continue receiving contacts.",
    contactLimitReached:
      "Free contact limit reached (50). Account temporarily suspended. Please subscribe to continue.",
    subscriptionRequired:
      "Subscription required to continue receiving contacts. Free limit is 50 contacts.",
  },
};

const formatMessage = (key, lang = "ar", ...args) => {
  const template = messages[lang]?.[key] || messages.ar[key];
  if (!template) return key;
  return template.replace(/%s|%d/g, () => args.shift());
};

module.exports = { formatMessage };
