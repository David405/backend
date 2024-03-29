## Auth Endpoints

# register user
route - url/api/users/register

body = {
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  is_employer: { type: Boolean, default: false },
  first_name: { type: String },
  last_name: { type: String },
  phone_number: { type: String },
  company_name: { type: String },
  role: { type: String },
  profession: { type: String },
  is_email_verified: { type: Boolean, default: false },
}

# sendVerificationMail
route = url/api/users/send-verification-mail

body = {
    email
}

# verify email
route  = url/api/users/verify

body = {
    code
}

# login
route = url/api/users/login

body = {
    email, 
    password
}

# forgot password
route = url/api/users/forgot-password

body = {
    email
}

# change password
route = url/api/users/change-password

body = {
    email, 
    newPassword,
    code
}

# edit profile
route = url/api/users/edit-password

body = {
    updatedData
}

JWT Token to be passed as header

# view profile
route = url/api/users/get-user-profile

JWT Token to be passed as header
