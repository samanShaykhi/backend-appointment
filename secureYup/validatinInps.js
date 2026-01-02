const Yup = require('yup')
exports.schemaProfileEdite = Yup.object().shape({
    phoneNumber: Yup.string()
        .required("شماره موبایل مشاور الزامی می باشد")
        .min(11, "شماره موبایل مشاور نباید کمتر از 11 کاراکتر باشد")
        .max(11, "شماره موبایل مشاور نباید بیشتر از 11 کاراکتر باشد"),
});
exports.validationConsultant = Yup.object().shape({
    phoneNumber: Yup.string()
        .required("شماره موبایل مشاور الزامی می باشد")
        .min(11, "شماره موبایل مشاور نباید کمتر از 11 کاراکتر باشد")
        .max(11, "شماره موبایل مشاور نباید بیشتر از 11 کاراکتر باشد"),
    firstName: Yup.string()
        .required("نام مشاور الزامی می باشد")
        .min(3, "نام مشاور نباید کمتر از 3 کاراکتر باشد")
        .max(12, "نام مشاور نباید بیشتر از 12 کاراکتر باشد"),
    lastName: Yup.string()
        .required("نام خانوادگی مشاور الزامی می باشد")
        .min(3, "نام خانوادگی مشاور نباید کمتر از 3 کاراکتر باشد")
        .max(22, "نام خانوادگی مشاور نباید بیشتر از 22 کاراکتر باشد"),
    education: Yup.string()
        .required("مدرک تحصیلی مشاور الزامی می باشد"),
    AboutMe: Yup.string()
        .required("توضیحات مشاور الزامی می باشد")
        .min(20, "توضیحات مشاور نباید کمتر از 20 کاراکتر باشد")
        .max(1000, "توضیحات مشاور نباید بیشتر از 1000 کاراکتر باشد"),
    amount: Yup.string()
        .required("مبلغ الزامی می باشد")
        .min(3, "مبلغ نباید کمتر از 3 کاراکتر باشد")
        .max(12, "مبلغ نباید بیشتر از 12 کاراکتر باشد"),
    experience: Yup.string()
        .required("میزان تجربه مشاور الزامی می باشد"),
    relatedCategories: Yup.string()
        .required("دسته بندی تخصص الزامی می باشد"),
});
exports.ValidationInpArtEdite = Yup.object().shape({
    metaDiscription: Yup.string()
        .max(100, "متا دیسکریپشن نباید بیشتر از ۱۰۰ کاراکتر باشد")
        .min(5, "متا دیسکریپشن باید حداقل 5 کاراکتر باشد")
        .required("متا دیسکریپشن الزامی است"),

    articleTitle: Yup.string()
        .max(50, "عنوان نباید بیشتر از 50 کاراکتر باشد")
        .min(5, "عنوان باید حداقل 5 کاراکتر باشد")
        .required("عنوان الزامی است"),
    body: Yup.string()
        .min(1000, "مقاله باید حداقل 1000 کاراکتر باشد")
        .required("مقاله الزامی است"),
})