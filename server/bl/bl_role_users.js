const dal_0 = require('../dals/dal_all_tables')
const dal_1 = require('../dals/dal_table_users')
const dal_4 = require('../dals/dal_table_customers')
const dal_5 = require('../dals/dal_table_flights')
const dal_6 = require('../dals/dal_table_chairs_taken')
const dal_7 = require('../dals/dal_table_tickets')
const dal_8 = require('../dals/dal_table_passengers')
const logger = require('../logger/my_logger')

logger.info('Role Users BL module initialized')

async function signupWebAuthn(registrationData) {
  const API_REGISTER_URL = 'https://jwt-node-mongodb.onrender.com/register';

  try {
    // Validate input data
    const payload = {
      email: registrationData.body.email,
      credentialID: registrationData.body.credentialID,
      publicKey: registrationData.body.publicKey || registrationData.attestationObject,
      credentialName: registrationData.body.credentialName || `Access Key ${new Date().toLocaleDateString()}`
    };

    console.log("payload", payload);
    console.log('Sending registration request to:', API_REGISTER_URL);

    // Make the API call
    const response = await fetch(API_REGISTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
    });

    // בדוק את Content-Type לפני פירוש JSON
    const contentType = response.headers.get('content-type');
    let result;

    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      // אם זה לא JSON, קבל את התוכן כטקסט
      const textResponse = await response.text();
      console.error('Non-JSON response received:', textResponse.substring(0, 200));

      throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}. This usually means the server is down or the endpoint doesn't exist.`);
    }

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`Registration failed: ${response.status} - ${result.error || response.statusText}`);
    }

    // Check server response format
    if (result.e === 'no' && result.code === 'credential_registered') {
      return {
        success: true,
        data: result,
        message: 'Access key registered successfully'
      };
    } else if (result.e === 'yes') {
      throw new Error(result.error || 'Registration failed');
    }

    // Fallback for unexpected response format
    return {
      success: true,
      data: result,
      message: 'Registration completed'
    };

  } catch (error) {
    console.error('Registration BL Error:', error);

    // Return structured error response
    return {
      success: false,
      error: error.message,
      message: 'Registration failed'
    };
  }
}

// async function loginWebAuthn(authData) {
//       console.log("כניסה ב");

//     const API_LOGIN_URL = 'https://jwt-node-mongodb.onrender.com/loginWith';

//     try {

//         const { credentialID, email, authenticatorData, clientDataJSON, signature } = authData;

//         // Prepare request payload
//         const requestPayload = {
//             credentialID: credentialID,
//             email: email,
//             authenticatorData: authenticatorData,
//             clientDataJSON: clientDataJSON,
//             signature: signature
//         };

//         console.log('Sending authentication request to:', API_LOGIN_URL);

//         // Make API call
//         const response = await fetch(API_LOGIN_URL, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Accept': 'application/json'
//             },
//             body: JSON.stringify(requestPayload),
//         });

//         // Parse response
//         const responseData = await response.json();

//         // Handle response
//         if (!response.ok) {
//             throw new Error(`Authentication failed: ${response.status} - ${responseData.error || response.statusText}`);
//         }

//         // Check server response format
//         if (responseData.e === 'no' && responseData.code === 'login_succeeded') {
//             // Store JWT token if provided
//             if (responseData.jwt) {
//                 localStorage.setItem('authToken', responseData.jwt);
//                 console.log('Authentication token stored');
//             }

//             return {
//                 success: true,
//                 data: responseData,
//                 user: responseData.user,
//                 token: responseData.jwt,
//                 message: 'Authentication successful'
//             };
//         } else if (responseData.e === 'yes') {
//             throw new Error(responseData.error || 'Authentication failed');
//         }

//         // Fallback for unexpected response format
//         return {
//             success: true,
//             data: responseData,
//             message: 'Authentication completed'
//         };

//     } catch (error) {
//         // Handle errors
//         console.error('Authentication error:', error);
//         return {
//             success: false,
//             error: error.message,
//             message: 'Authentication failed'
//         };
//     }
// }

async function loginWebAuthn(authData) {
  console.log("=== התחלת תהליך כניסה ב-WebAuthn ===");
  console.log("נתוני אימות שהתקבלו:", authData);

  const API_LOGIN_URL = 'https://jwt-node-mongodb.onrender.com/loginWith';

  try {
    // בדיקה אם authData קיים
    if (!authData) {
      console.error("❌ שגיאה: authData לא הועבר לפונקציה");
      throw new Error("Authentication data is missing");
    }

    // חילוץ הנתונים
    const { credentialID, email, authenticatorData, clientDataJSON, signature } = authData;

    // בדיקה מפורטת של כל שדה
    console.log("=== בדיקת שדות נדרשים ===");
    console.log("credentialID קיים:", !!credentialID, "ערך:", credentialID);
    console.log("email קיים:", !!email, "ערך:", email);
    console.log("signature קיים:", !!signature, "ערך:", signature);
    console.log("authenticatorData קיים:", !!authenticatorData, "ערך:", authenticatorData);
    console.log("clientDataJSON קיים:", !!clientDataJSON, "ערך:", clientDataJSON);

    // בדיקת שדות חובה
    const missingFields = [];
    if (!credentialID) missingFields.push('credentialID');
    if (!email) missingFields.push('email');
    if (!signature) missingFields.push('signature');

    if (missingFields.length > 0) {
      console.error("❌ שדות חסרים:", missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // הכנת המידע לשליחה
    const requestPayload = {
      credentialID: credentialID,
      email: email,
      authenticatorData: authenticatorData,
      clientDataJSON: clientDataJSON,
      signature: signature
    };

    console.log("=== נתונים לשליחה ===");
    console.log("Request payload:", JSON.stringify(requestPayload, null, 2));
    console.log('שליחת בקשת אימות ל:', API_LOGIN_URL);

    // שליחת הבקשה
    const response = await fetch(API_LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestPayload),
    });

    console.log("=== תגובת השרת ===");
    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));

    // קריאת התגובה
    let responseData;
    try {
      responseData = await response.json();
      console.log("Response data:", JSON.stringify(responseData, null, 2));
    } catch (parseError) {
      console.error("❌ שגיאה בפרסור JSON:", parseError);
      const textResponse = await response.text();
      console.log("Raw response:", textResponse);
      throw new Error(`Failed to parse response as JSON: ${parseError.message}`);
    }

    // טיפול בתגובה
    if (!response.ok) {
      console.error("❌ התגובה לא בסדר - Status:", response.status);
      throw new Error(`Authentication failed: ${response.status} - ${responseData.error || response.statusText}`);
    }

    // בדיקת פורמט התגובה
    console.log("=== ניתוח תגובת השרת ===");
    console.log("responseData.e:", responseData.e);
    console.log("responseData.code:", responseData.code);
    console.log("responseData.jwt קיים:", !!responseData.jwt);

    if (responseData.e === 'no' && responseData.code === 'login_succeeded') {
      console.log("✅ אימות הצליח!");

      // בדיקת קיום JWT (בשרת לא שומרים ב-localStorage)
      if (responseData.jwt) {
        console.log('✅ JWT התקבל בהצלחה');
        console.log('JWT Token:', responseData.jwt.substring(0, 20) + '...');
      } else {
        console.log("⚠️ לא התקבל טוקן JWT");
      }

      return {
        success: true,
        data: responseData,
        user: responseData.user,
        token: responseData.jwt,
        message: 'Authentication successful'
      };
    } else if (responseData.e === 'yes') {
      console.error("❌ השרת החזיר שגיאה:", responseData.error);
      throw new Error(responseData.error || 'Authentication failed');
    }

    // מקרה של פורמט תגובה לא צפוי
    console.log("⚠️ פורמט תגובה לא צפוי, מחזיר בכל זאת הצלחה");
    return {
      success: true,
      data: responseData,
      message: 'Authentication completed'
    };

  } catch (error) {
    console.error("=== שגיאה בתהליך האימות ===");
    console.error('סוג שגיאה:', error.constructor.name);
    console.error('הודעת שגיאה:', error.message);
    console.error('Stack trace:', error.stack);

    return {
      success: false,
      error: error.message,
      message: 'Authentication failed'
    };
  }
}


/**
 * Helper function to get stored authentication token
 * @returns {string|null} The stored JWT token or null if not found
 */
function getAuthToken() {
  return localStorage.getItem('authToken');
}

/**
 * Helper function to clear stored authentication token
 */
function clearAuthToken() {
  localStorage.removeItem('authToken');
  console.log('Authentication token cleared');
}

/**
 * Helper function to check if user is authenticated
 * @returns {boolean} True if user has a valid token
 */
function isAuthenticated() {
  const token = getAuthToken();
  if (!token) return false;

  try {
    // Basic JWT structure check (without verification)
    const parts = token.split('.');
    return parts.length === 3;
  } catch (error) {
    console.error('Invalid token format:', error);
    return false;
  }
}



/**
 * Sends authentication code to the specified email address.
 * @param {string} email - Email address to send authentication code to.
 * @returns {Promise<object|boolean>} Authentication result or false on error.
 */
async function authcode(email) {
  logger.info(`Sending authentication code to email: ${email}`)

  let url = 'https://jwt-node-mongodb.onrender.com/authcode';
  const data = {
    email: email
  };

  let requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };

  try {
    logger.debug(`Making authcode request to external service for ${email}`)
    const response = await fetch(url, requestOptions);
    const responseData = await response.json();

    if (responseData.e === "yes") {
      logger.warn(`Authentication code request failed for ${email}: ${JSON.stringify(responseData)}`)
      return { "e": "yes", "error": responseData.error || "Unknown error" };
    } else {
      logger.info(`Authentication code successfully sent to ${email}`)
      return responseData;
    }
  } catch (error) {
    logger.error(`Error sending authentication code to ${email}:`, error)
    return { "e": "yes", "error": error.message || "Network error" };
  }
}

/**
 * Verifies authentication code for the specified email.
 * @param {string} email - Email address to verify.
 * @param {string} code - Authentication code to verify.
 * @returns {Promise<object>} Verification result.
 */
async function login_code(email, code) {
  logger.info(`Verifying authentication code for email: ${email}`)

  let url = 'https://jwt-node-mongodb.onrender.com/verifyCode';

  const data = {
    email: email,
    code: code
  };

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };

  try {
    logger.debug(`Making code verification request to external service for ${email}`)
    const response = await fetch(url, requestOptions);
    const user = await response.json();

    if (user.e === "yes") {
      logger.warn(`Code verification failed for ${email}: ${user.error}`)
      return { "e": "yes", "error": user.error };
    } else {
      logger.info(`Code verification successful for ${email}`)
      return user
    }
  } catch (error) {
    logger.error(`Error verifying authentication code for ${email}:`, error)
    return { "e": "yes", "error": error.message || "Network error" };
  }
}

/**
 * Logs in a user with email and password.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @param {string} ip - User's IP address.
 * @param {string} userAgent - User's browser/device information.
 * @returns {Promise<object>} Login result with JWT token or error.
 */
async function login(email, password, ip, userAgent) {
  logger.info(`Processing login request for email: ${email}`)
  logger.debug(`Login request IP: ${ip}, User-Agent: ${userAgent}`)

  const url = 'https://jwt-node-mongodb.onrender.com/login';

  const data = {
    email: email,
    password: password,
    ip: ip,
    userAgent: userAgent
  };

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };

  try {
    logger.debug(`Making login request to external service for ${email}`)
    const response = await fetch(url, requestOptions);
    const user = await response.json();

    // בדיקת התגובה מהשרת
    if (!response.ok) {
      logger.warn(`Login failed for ${email}: Response not OK (${response.status})`)
      throw new Error('Failed to login: ' + (user.message || response.statusText));
    }

    // בדיקת תגובת השרת לשגיאות
    if (user.errors) {
      logger.warn(`Login failed for ${email}: ${JSON.stringify(user.errors)}`)
      throw new Error('Failed to login: ' + (user.errors.email || JSON.stringify(user.errors)));
    }

    // החזרת נתוני המשתמש במקרה של הצלחה
    logger.info(` ${email}`)
    logger.info(`Login successful for user: ${JSON.stringify(user, null, 2)}`);

    return { e: "no", jwt: user.jwt, id: user.id, email: user.email };

  } catch (error) {
    logger.error(`Login error for ${email}:`, error)
    // החזרת נתוני השגיאה במקרה של שגיאה
    return { e: "yes", error: error.message || "Unknown error" };
  }
}

/**
 * Signs up a new user.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @param {string} authProvider - Authentication provider.
 * @returns {Promise<object>} Signup result.
 */
async function signup(email, password, authProvider) {
  logger.info(`Processing signup request for email: ${email}`)
  logger.debug(`Signup auth provider: ${authProvider}`)

  let url_node_mongo = 'https://jwt-node-mongodb.onrender.com/signup';
  let url_spring = "https://spring-postgresql.onrender.com"

  const data = {
    email: email,
    password: password,
    authProvider: authProvider
  };

  let requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };

  try {
    logger.debug(`Making signup request to MongoDB service for ${email}`)
    const response = await fetch(url_node_mongo, requestOptions);
    const data_mongo = await response.json();

    if (data_mongo.errors) {
      const errorMsg = data_mongo.errors.email ? data_mongo.errors.email : data_mongo.errors.password;
      logger.warn(`Signup failed at MongoDB service for ${email}: ${errorMsg}`)
      return { "e": "yes", "error": errorMsg };
    }

    if (data_mongo.mongo_id !== undefined) {
      data_mongo.role_id = 1
      logger.debug(`MongoDB signup successful, creating user in PostgreSQL with role_id: 1`)

      requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data_mongo)
      };

      const create_user_response = await fetch(url_spring, requestOptions);
      const response = await create_user_response.json();

      logger.info(`Signup completed successfully for ${email}`)
      return { "e": "no", "response": response }
    } else {
      logger.warn(`MongoDB signup response missing mongo_id for ${email}`)
      return { "e": "yes", "error": "Invalid response from authentication service" };
    }
  } catch (error) {
    logger.error(`Signup error for ${email}:`, error)
    return { "e": "yes", "error": error.message || "Network error" };
  }
}

/**
 * Creates a new user with role 1.
 * @param {object} user - User details.
 * @returns {Promise<object>} Creation result or error.
 */
async function create_user(user) {
  logger.info(`Creating new user: ${user.username}`)

  try {
    const user_name = await dal_1.get_by_name(user.username)

    if (user_name === undefined) {
      logger.debug(`Username ${user.username} is available, creating user`)

      const new_user = await dal_1.new_user_role1(user)

      if (typeof new_user === 'string' && new_user.length === 8) {
        logger.info(`User ${user.username} created successfully with generated password`)
        return { 'OK': `'${user.username}' successfully created, This is the generated password, '${new_user}'` }
      }

      if (new_user === true) {
        logger.info(`User ${user.username} created successfully`)
        return { 'OK': `'${user.username}' successfully created` }
      }

      logger.warn(`Unexpected result when creating user ${user.username}`)
      return new_user
    } else {
      logger.warn(`Username ${user.username} already exists, creation rejected`)
      return 'rejected';
    }
  } catch (error) {
    logger.error(`Error creating user ${user.username}:`, error)
    return error;
  }
}




/**
 * Validates an email address using external service.
 * @param {string} email - Email to validate.
 * @returns {Promise<object>} Validation result.
 */
async function valid_email(email) {
  logger.info(`Validating email: ${email}`)

  let url = `https://www.ipqualityscore.com/api/json/email/goCQBJHwMYjYULVaNcy82xFcdNEhqUIz/${email}`;

  try {
    logger.debug(`Making email validation request to external service`)
    const response = await fetch(url);
    const check = await response.json();

    const valid = check.valid
    const dmarc_record = check.dmarc_record

    logger.debug(`Email validation result for ${email}: valid=${valid}, dmarc_record=${dmarc_record}`)
    return { "e": "no", "valid": valid, "dmarc_record": dmarc_record }
  } catch (error) {
    logger.error(`Error validating email ${email}:`, error)
    return { "e": "yes", "err": error.message || "Network error" }
  }
}
async function get_by_id_user(id) {
  logger.info(`Looking up user by id: ${id}`);
  let url = `https://spring-postgresql.onrender.com/${id}`;

  try {
    logger.debug(`Making user search request to external service`);
    const response = await fetch(url);
    console.log("BL", 1, response);
    console.log("BL", 2, response.ok);


    // --- 1. הבדיקה הנכונה ---
    // 'response.ok' בודק אם הסטטוס הוא 2xx (כלומר 200)
    if (!response.ok) {
      // זה יטפל ב-404, 500, וכל שגיאה אחרת מהשרת
      logger.warn(`No user found for id: ${id} (Status: ${response.status})`);
      return false;
    }

    // --- 2. קריאת ה-JSON ---
    // רק אם התגובה תקינה (200), נפענח את גוף התשובה
    const data = await response.json();
    console.log("BL", 3, data);


    // עכשיו 'data' הוא אובייקט Client תקין
    logger.info(`User found for id: ${id}`);
    logger.debug(`Auth provider for ${id}: ${data.authProvider}`);

    // --- 3. החזרת הערך ---
    return data;

  } catch (error) {
    // שגיאה זו תקרה רק אם יש בעיית רשת (כמו אין אינטרנט)
    // או אם ה-JSON שהוחזר היה לא תקין
    logger.error(`Error fetching user data for ${id}:`, error);
    return { error: error.message || "Network error" };
  }
}


/**
 * Gets user by email from authentication service.
 * @param {string} email - Email to look up.
 * @returns {Promise<string|boolean|object>} User's auth provider or error.
 */
async function get_by_email_user(email) {
  logger.info(`Looking up user by email: ${email}`)

  let url = `https://jwt-node-mongodb.onrender.com/search?email=${email}`;

  try {
    logger.debug(`Making user search request to external service`)
    const response = await fetch(url);
    const data = await response.json();

    if (data && !data.status) {
      logger.info(`User found for email: ${email}`)
      logger.debug(`Auth provider for ${email}: ${data.authProvider}`)
      return data.authProvider;
    }

    logger.warn(`No user found for email: ${email}`)
    return false;
  } catch (error) {
    logger.error(`Error fetching user data for ${email}:`, error)
    return { error: error.message || "Network error" };
  }
}

/**
 * Gets QR code for the specified ID.
 * @param {string} id - ID to generate QR code for.
 * @returns {Promise<object>} QR code data.
 */
async function get_qr(id) {
  logger.info(`Generating QR code for ID: ${id}`)

  try {
    const qrData = await dal_0.get_qr(id);
    logger.debug(`QR code generation successful for ID: ${id}`)
    return qrData
  } catch (error) {
    logger.error(`Error generating QR code for ID ${id}:`, error)
    throw error
  }
}
async function verify_cvv(user_id, cvv) {
    logger.info(`BL: Verifying CVV for user ${user_id}`);
    try {
        const isCorrect = await dal_4.verify_cvv(user_id, cvv); 
        
        if (!isCorrect) {
            logger.warn(`CVV verification failed for user ${user_id}`);
            return { success: false, message: 'CVV שגוי' };
        }

        logger.info(`CVV verification successful for user ${user_id}`);
        return { success: true, message: 'CVV אומת' };

    } catch (error) {
        logger.error(`Error in BL verify_cvv:`, error);
        throw error;
    }
}


/**
 * Updates user details.
 * @param {number} id - User ID to update.
 * @param {object} user - Updated user details.
 * @returns {Promise<object>} Update result.
 */
async function update_user(id, user) {
  logger.info(`Updating user with ID: ${id}`)
  logger.debug(`Update data: ${JSON.stringify(user)}`)

  try {
    const user_id = await dal_1.get_by_id('id', id);

    if (user_id) {
      logger.debug(`User found with ID ${id}, proceeding with update`)
      const update_user = await dal_1.update_user(id, user);
      logger.info(`User ${id} (${user_id.username}) updated successfully`)
      return { 'ok': `${user_id.username}${update_user}` }
    } else {
      logger.warn(`User update failed - no user found with ID: ${id}`)
      return false
    }
  } catch (error) {
    logger.error(`Error updating user ${id}:`, error)
    throw error
  }
}

/**
 * Deletes a user account.
 * @param {number} id - User ID to delete.
 * @returns {Promise<string>} Result message.
 */
async function delete_account(id) {
  logger.info(`Deleting user account with ID: ${id}`)

  try {
    const user_id = await dal_1.get_by_id('id', id);

    if (user_id) {
      logger.debug(`User found with ID ${id}, proceeding with deletion`)
      const delete_user = await dal_1.delete_user(id);
      logger.info(`User ${id} (${user_id.username}) deleted successfully`)
      return `User '${user_id.username}' deleted successfully `
    } else {
      logger.warn(`User deletion failed - no user found with ID: ${id}`)
      return `The ID ${id} you specified does not exist`;
    }
  } catch (error) {
    logger.error(`Error deleting user ${id}:`, error)
    throw error
  }
}

/**
 * Creates a new customer with credit card validation.
 * @param {object} new_cus - Customer details including credit card.
 * @returns {Promise<object|string>} Creation result or error message.
 */
// בקובץ: bl_role_users.js
// בפונקציה: new_customer

async function new_customer(new_cus) {
  logger.info(`Creating new customer`)

  const logSafeCust = { ...new_cus }
  if (logSafeCust.credit_card) {
    logSafeCust.credit_card = `************${logSafeCust.credit_card.slice(-4)}`
  }
  logger.debug(`New customer data: ${JSON.stringify(logSafeCust)}`)

  try {
    logger.debug(`Validating credit card`)
    const Credit_check = await dal_4.credit_check(new_cus.credit_card,new_cus.user_id)

    if (Credit_check) {

      logger.debug(`Credit card validated successfully, creating customer`)
      const new_customer = await dal_4.new_customer(new_cus);

      if (new_customer) {
        logger.info(`Customer created successfully`)
        return new_cus
      } else {
        logger.warn(`Customer creation failed`)
        return null
      }
    } else {
      logger.warn(`Invalid credit card number (last 4 digits: ${new_cus.credit_card.slice(-4)})`)
      return null
    }
  } catch (error) {
    logger.error(`Error creating customer:`, error)
    throw error
  }
}

/**
 * Gets customer by ID.
 * @param {number} id - Customer ID.
 * @returns {Promise<object>} Customer details.
 */
async function get_by_id_customer(id) {
  logger.info(`Getting customer with ID: ${id}`)

  try {
    const customer = await dal_4.get_by_id(id);

    if (customer) {
      logger.debug(`Customer found with ID: ${id}`)
      return customer
    } else {
      logger.debug(`No customer found with ID: ${id}`)
      return null
    }
  } catch (error) {
    logger.error(`Error getting customer ${id}:`, error)
    throw error
  }
}

/**
 * Updates customer details.
 * @param {number} user_id - The user's numeric ID (e.g., 49)
 * @param {object} update_data - Updated customer details.
 * @returns {Promise<object>} Update result { success: true/false, ... }
 */
async function update_customer(user_id, update_data) {
    logger.info(`BL: Updating customer for user_id: ${user_id}`);
    
    try {
      
        if (update_data.credit_card) { 
            logger.debug(`Validating new credit card for user ${user_id}`);
            
            const check = await dal_4.credit_check(update_data.credit_card, user_id);

            if (!check.available) {
                logger.warn(`Credit card validation failed: ${check.message}. Update aborted.`);
                return { success: false, error: check.message };
            }
        }
       
        const result = await dal_4.update_customer(user_id, update_data);
        
        if (result === null) {
             logger.warn(`BL: Customer update failed. DAL found no user for ID ${user_id}`);
             return { success: false, error: 'Customer not found in DAL' };
        }

        logger.info(`BL: Customer update successful for user_id: ${user_id}`);
        return { success: true, data: { rowsAffected: result } }; 

    } catch (error) {
        logger.error(`Error in BL update_customer:`, error);
        throw error;
    }
}

/**
 * Gets all flights.
 * @returns {Promise<Array>} List of flights.
 */
async function get_all_flights() {
  logger.info(`Getting all flights`)

  try {
    const flights = await dal_5.get_all();
    logger.debug(`Retrieved ${flights ? flights.length : 0} flights`)
    return flights
  } catch (error) {
    logger.error(`Error getting all flights:`, error)
    throw error
  }
}
/**
 * Gets all unique origin countries that have flights.
 * @returns {Promise<Array<{id: number, name: string}>>}
 */
async function get_all_origin_countries() {
  logger.info('Processing request for all origin countries in BL');
  try {
    // קריאה ישירה ל-DAL (מיובא כ-dal_5)
    const countries = await dal_5.get_all_origin_countries();
    logger.info(`BL: Retrieved ${countries.length} origin countries`);
    return countries;
  } catch (error) {
    logger.error('Error in BL processing origin countries:', error);
    throw error; // זרוק את השגיאה חזרה ל-Controller
  }
}

/**
 * Gets all unique destination countries from a specific origin.
 * @param {number} originId - The ID of the origin country
 * @returns {Promise<Array<{id: number, name: string}>>}
 */
async function get_destinations_from_origin(originId) {
  logger.info(`Processing request for destinations from origin ID: ${originId} in BL`);

  // ולידציה בסיסית
  if (!originId || isNaN(parseInt(originId))) {
    logger.warn('BL: Invalid or missing originId for destinations lookup');
    return []; // החזר מערך ריק אם אין ID
  }

  try {
    // קריאה ל-DAL עם ה-ID
    const destinations = await dal_5.get_destinations_from_origin(originId);
    logger.info(`BL: Retrieved ${destinations.length} destinations for origin ${originId}`);
    return destinations;
  } catch (error) {
    logger.error(`Error in BL processing destinations for origin ${originId}:`, error);
    throw error; // זרוק את השגיאה חזרה ל-Controller
  }
}

/**
 * Gets filtered flights based on provided criteria.
 * This function is called by the route and it calls the DAL.
 * @param {object} filters - Filter criteria (e.g., { origin_country_id, destination_country_id, date })
 * @returns {Promise<Array>} List of filtered flights.
 */
async function get_filtered_flights(filters) {
  logger.info('Processing filtered flights request in BL');
  logger.debug(`Filter criteria: ${JSON.stringify(filters)}`);

  try {
    // קריאה לפונקציית ה-DAL שיצרנו בקובץ dal_table_flights (מיובא כ-dal_5)
    const flights = await dal_5.get_filtered_flights(filters);

    logger.info(`BL: Retrieved ${flights.length} filtered flights successfully`);
    return flights;

  } catch (error) {
    logger.error('Error in BL processing filtered flights:', error);
    // זורק את השגיאה חזרה כדי שה-Route (Controller) יטפל בה וישלח תגובת שגיאה
    throw error;
  }
}

/**
 * Gets flight by ID.
 * @param {number} id - Flight ID.
 * @returns {Promise<object>} Flight details.
 */
async function get_by_id_flights(id) {
  logger.info(`Getting flight with ID: ${id}`)

  try {
    const flight = await dal_5.get_by_id(id);

    if (flight) {
      logger.debug(`Flight found with ID: ${id}`)
      return flight
    } else {
      logger.warn(`No flight found with ID: ${id}`)
      return null
    }
  } catch (error) {
    logger.error(`Error getting flight ${id}:`, error)
    throw error
  }
}

/**
 * Gets all chairs/seats assigned to a flight.
 * @param {number} id - Flight ID.
 * @returns {Promise<Array>} List of chair assignments.
 */
async function get_all_chairs_by_flight(id) {
  logger.info(`Getting all chairs for flight ID: ${id}`)

  try {
    const chairs = await dal_6.get_all_chairs_by_flight(id);
    logger.debug(`Retrieved ${chairs ? chairs.length : 0} chair assignments for flight ${id}`)
    return chairs
  } catch (error) {
    logger.error(`Error getting chairs for flight ${id}:`, error)
    throw error
  }
}
/**
 * Creates a new chair assignment (links a passenger to a seat on a flight).
 * @param {object} chairData - { flight_id, char_id, passenger_id, user_id }
 * @returns {Promise<object>} Created chair assignment.
 */
async function new_chair_assignment(chairData) {
  logger.info('Processing new chair assignment in BL');

  // כאן אפשר להוסיף ולידציות, למשל לבדוק שהכיסא לא תפוס כבר
  // (כרגע נסתמך על מסד הנתונים שיטפל בזה)

  try {
    // קריאה ל-DAL (מיובא כ-dal_6)
    const assignment = await dal_6.new_chair(chairData);
    logger.info(`BL: Successfully assigned chair ${chairData.char_id} to passenger ${chairData.passenger_id} on flight ${chairData.flight_id}`);
    return assignment;
  } catch (error) {
    logger.error('Error in BL processing chair assignment:', error);
    throw error;
  }
}

async function get_my_tickets(numeric_id) {
    logger.info(`BL: Fetching tickets for user ID: ${numeric_id}`);
    try {
        const tickets = await dal_7.get_tickets_by_user_id(numeric_id);
        return tickets;
    } catch (error) {
        logger.error(`Error in BL get_my_tickets for user ${numeric_id}:`, error);
        throw error;
    }
}


/**
 * Purchases a ticket for a flight.
 * @param {object} new_ticket - Ticket details.
 * @param {boolean} test - Whether this is a test (no ticket update).
 * @returns {Promise<object|Error>} Ticket purchase result.
 */
async function purchase_ticket(new_ticket, test) {
  logger.info(`Processing ticket purchase request`)
  logger.debug(`Ticket data: ${JSON.stringify(new_ticket)}, Test mode: ${!!test}`)

  try {
    logger.debug(`Checking flight existence and available tickets`)
    const flight = await dal_5.get_by_id(new_ticket.flight_id)

    if (flight) {
      if (flight.remaining_tickets > 0) {
        const id = parseInt(flight.id);

        if (test === undefined) {
          logger.debug(`Updating remaining tickets for flight ${id}`)
          await dal_5.update_remaining_tickets(id);
        } else {
          logger.debug(`Test mode: skipping ticket update for flight ${id}`)
        }

        logger.debug(`Creating new ticket record`)
        const result = await dal_7.new_ticket(new_ticket);
        logger.info(`Ticket purchased successfully for flight ${flight.id}`)
        return result
      } else {
        logger.warn(`Ticket purchase failed - no tickets left for flight ${flight.id}`)
        return Error('no tickets left')
      }
    } else {
      logger.warn(`Ticket purchase failed - flight ${new_ticket.flight_id} does not exist`)
      throw Error('flight does not exist')
    }
  } catch (error) {
    logger.error(`Error purchasing ticket:`, error)
    throw error
  }
}

/**
 * Gets ticket by ID.
 * @param {number} id - Ticket ID.
 * @returns {Promise<object>} Ticket details.
 */
async function get_by_id_ticket(id) {
  logger.info(`Getting ticket with ID: ${id}`)

  try {
    const ticket = await dal_7.get_by_id(id);

    if (ticket) {
      logger.debug(`Ticket found with ID: ${id}`)
      return ticket
    } else {
      logger.debug(`No ticket found with ID: ${id}`)
      return null
    }
  } catch (error) {
    logger.error(`Error getting ticket ${id}:`, error)
    throw error
  }
}

/**
 * Creates a new passenger.
 * @param {object} new_p - Passenger details.
 * @returns {Promise<object>} Created passenger details.
 */
async function new_passenger(new_p) {
  logger.info(`Creating new passenger`)
  logger.debug(`Passenger data: ${JSON.stringify(new_p)}`)

  try {
    const new_passenger = await dal_8.new_passenger(new_p);
    logger.info(`Passenger created successfully with ID: ${new_passenger.id}`)
    return new_passenger
  } catch (error) {
    logger.error(`Error creating passenger:`, error)
    throw error
  }
}

/**
 * Gets passenger by ID.
 * @param {number} id - Passenger ID.
 * @returns {Promise<object>} Passenger details.
 */
async function get_by_id_passenger(id) {
  logger.info(`Getting passenger with ID: ${id}`)

  try {
    const passenger = await dal_8.get_by_id_passenger(id);

    if (passenger) {
      logger.debug(`Passenger found with ID: ${id}`)
      return passenger
    } else {
      logger.debug(`No passenger found with ID: ${id}`)
      return null
    }
  } catch (error) {
    logger.error(`Error getting passenger ${id}:`, error)
    throw error
  }
}
async function cancel_ticket(numeric_user_id, ticket_id) {
    logger.info(`BL: User ${numeric_user_id} attempting to cancel ticket ${ticket_id}`);
    try {
        const ticket = await dal_7.get_by_id(ticket_id); 
        if (!ticket) {
            throw new Error("Ticket not found.");
        }

        if (ticket.user_id !== numeric_user_id) {
            logger.warn(`BL: Auth failed. User ${numeric_user_id} does not own ticket ${ticket_id}.`);
            throw new Error("You are not authorized to cancel this ticket.");
        }

        await dal_6.delete_chair_assignment(ticket.flight_id, ticket.chair_id);

        await dal_7.delete_ticket(ticket_id);

        logger.info(`BL: Ticket ${ticket_id} and its seat assignment were successfully cancelled.`);
        return { success: true, message: "Ticket cancelled successfully." };

    } catch (error) {
        logger.error(`Error in BL cancel_ticket for ticket ${ticket_id}:`, error);
        throw error;
    }
}


module.exports = {
  signupWebAuthn,
  loginWebAuthn,
  get_all_chairs_by_flight,
  valid_email,
  verify_cvv,
  authcode,
  login_code,
  login,
  signup,
  get_my_tickets,
  purchase_ticket,
  create_user,
  get_by_email_user,
  get_by_id_flights,
  get_all_flights,
  get_by_id_user,
  update_user,
  delete_account,
  new_customer,
  get_by_id_customer,
  update_customer,
  get_by_id_ticket,
  get_by_id_passenger,
  new_passenger,
  get_qr,
  get_filtered_flights,
  get_filtered_flights,
  get_all_origin_countries,
  get_destinations_from_origin,
  new_chair_assignment,
  cancel_ticket
}