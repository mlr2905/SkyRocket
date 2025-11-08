const bl = require('../bl/bl_role_users');
const logger = require('../logger/my_logger');


exports.signupWebAuthn = async (req, res) => {
    console.log("כניסה א");

    try {
        logger.info('WebAuthn registration request received');

        // קריאה ל-Business Logic
        const result = await bl.signupWebAuthn(req);
        console.log("result", result);



        // טיפול בתגובה מה-BL (במקרה שהוא מחזיר ולא שולח ישירות)
        if (result) {
            if (result.e === "yes") {
                logger.warn(`Registration failed: ${result.error}`);
                return res.status(400).json({
                    "e": "yes",
                    "error": result.error
                });
            } else {
                logger.info('Registration successful');
                return res.status(201).json(result);
            }
        }

    } catch (error) {
        logger.error('Error in WebAuthn registration:', error);


    }
};

/**
 * Router function for WebAuthn authentication
 */
exports.loginWebAuthn = async (req, res) => {
    console.log("=== התחלת WebAuthn Router ===");

    const email = req.body?.email || 'unknown';

    try {
        console.log("=== בדיקת נתוני הבקשה ===");
        console.log("Request method:", req.method);
        console.log("Request headers:", JSON.stringify(req.headers, null, 2));
        console.log("Request body:", JSON.stringify(req.body, null, 2));
        console.log("Email extracted:", email);

        logger.info(`WebAuthn login attempt for: ${email}`);

        // בדיקת נתונים נדרשים
        const requiredFields = ['credentialID', 'signature', 'email'];
        const missingFields = [];

        requiredFields.forEach(field => {
            if (!req.body[field]) {
                missingFields.push(field);
            }
        });

        console.log("=== בדיקת שדות נדרשים ===");
        console.log("Required fields:", requiredFields);
        console.log("Missing fields:", missingFields);

        if (missingFields.length > 0) {
            console.error("❌ שדות חסרים בבקשה:", missingFields);
            logger.warn(`Missing required fields for ${email}: ${missingFields.join(', ')}`);
            return res.status(400).json({
                "e": "yes",
                "error": `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // הכנת אובייקט הנתונים לפונקציה
        const authData = {
            credentialID: req.body.credentialID,
            email: req.body.email,
            signature: req.body.signature,
            authenticatorData: req.body.authenticatorData,
            clientDataJSON: req.body.clientDataJSON
        };

        console.log("=== נתונים שמועברים ל-BL ===");
        console.log("Auth data:", JSON.stringify(authData, null, 2));

        // קריאה ל-Business Logic עם הנתונים הנכונים
        console.log("🔄 קוראים ל-bl.loginWebAuthn...");
        const result = await bl.loginWebAuthn(authData);

        console.log("=== תגובה מ-BL ===");
        console.log("BL Result:", JSON.stringify(result, null, 2));

        // טיפול בתגובה מה-BL
        if (result) {
            if (result.success === false) {
                console.log("❌ BL החזיר כישלון");
                logger.warn(`Login failed for ${email}: ${result.error}`);
                return res.status(401).json({
                    "e": "yes",
                    "error": result.error || "Authentication failed"
                });
            }

            if (result.success === true) {
                console.log("✅ BL החזיר הצלחה");

                // בדיקה אם יש JWT
                const token = result.token || result.data?.jwt;

                if (token) {
                    console.log("✅ נמצא JWT טוקן");
                    logger.info(`Login successful for ${email}`);
                    console.info("loginWebAuthn",token   );
                    

                    // הגדרת JWT בעוגיה
                    res.cookie('sky', token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000) // 3 שעות ו־15 דקות
                    });

                    console.log("✅ JWT cookie הוגדר");
                    logger.debug(`JWT cookie set for ${email}`);

                    // בניית תגובה מוצלחת
                    const response = {
                        "e": "no",
                        "code": "login_succeeded",
                        "message": "Authentication successful",
                        // "jwt": token,
                        // "user": result.user || result.data?.user,
                        "redirectUrl": "https://skyrocket.onrender.com/search_form.html"
                    };

                    console.log("=== תגובה סופית ללקוח ===");
                    console.log("Final response:", JSON.stringify(response, null, 2));

                    return res.status(200).json(response);
                } else {
                    console.log("⚠️ לא נמצא JWT בתגובה");
                    logger.warn(`No JWT token in successful response for ${email}`);
                    return res.status(500).json({
                        "e": "yes",
                        "error": "Authentication succeeded but no token received"
                    });
                }
            }

            // תגובה ישנה (לתמיכה לאחור)
            if (result.e === "yes") {
                console.log("❌ תגובה ישנה עם שגיאה");
                logger.warn(`Login failed for ${email}: ${result.error}`);
                return res.status(401).json({
                    "e": "yes",
                    "error": result.error
                });
            } else if (result.e === "no" && result.jwt) {
                console.log("✅ תגובה ישנה מוצלחת");
                logger.info(`Login successful for ${email}`);
                console.info("loginWebAuthn2",result);
                

                // הגדרת JWT בעוגיה
                const token = result.jwt;
                res.cookie('sky', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000)
                });

                logger.debug(`JWT cookie set for ${email}`);

                const response = {
                    "e": "no",
                    "code": "login_succeeded",
                    "message": "Authentication successful",
                    "jwt": token,
                    "user": result.user,
                    "redirectUrl": "https://skyrocket.onrender.com/search_form.html"
                };

                return res.status(200).json(response);
            }
        }

        // במקרה של תגובה לא צפויה
        console.error("❌ תגובה לא צפויה מ-BL");
        console.error("Unexpected result:", result);
        logger.error(`Unexpected response format from BL for ${email}`, result);

        return res.status(500).json({
            "e": "yes",
            "error": "Unexpected authentication response"
        });

    } catch (error) {
        console.error("=== שגיאה ב-Router ===");
        console.error("Error type:", error.constructor.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);

        logger.error(`Error in WebAuthn login for ${email}:`, error);

        return res.status(500).json({
            "e": "yes",
            "error": "Internal server error during authentication"
        });
    }
};


exports.authCode = async (req, res) => {
    try {
        logger.info('Processing auth code request')
        const email = req.body.email;
        logger.debug(`Auth code requested for email: ${email}`)

        const datas = await bl.authcode(email)
        if (datas.e === "yes") {
            logger.warn(`Auth code generation failed for ${email}: ${datas.error}`)
            res.status(409).json({ "e": "yes", "errors": `${datas.error}` });
        } else {
            if (datas.code !== undefined) {
                logger.info(`Auth code successfully generated for ${email}`)
                res.status(200).json({ datas });
            }
        }
    } catch (error) {
        logger.error('Error in auth code generation:', error)
        res.status(503).json({ 'error': 'The request failed, try again later', error });
    }
}

exports.validation = async (req, res) => {
    try {
        const email = req.body.email;
        const code = req.body.code;
        logger.info(`Processing code validation for email: ${email}`)
        logger.debug(`Validating code for ${email}`)

        const datas = await bl.login_code(email, code)
        if (datas.e === "yes") {
            logger.warn(`Code validation failed for ${email}: ${datas.error}`)
            res.status(409).json({ "e": "yes", "error": `${datas.error}` });
        }
        else {
            logger.info(`Code validation successful for ${email}`)
            const token = datas.jwt
            res.cookie('sky', token, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000) // 3 שעות ו־15 דקות במילישניות
            });
            logger.debug(`JWT cookie set for ${email}`)

            const redirectUrl = 'https://skyrocket.onrender.com/search_form.html';

            res.status(200).json({ datas, redirectUrl, });
        }
    }
    catch (error) {
        logger.error('Error in code validation:', error)
        res.status(503).json({ 'error': 'The request failed, try again later', error });
    }
};

exports.ip = async (req, res) => {
    logger.debug('IP lookup request received')

    const forwardedFor = req.headers['x-forwarded-for'];
    const clientIPs = forwardedFor ? forwardedFor.split(',').map(ip => ip.trim()) : [];
    const ip = clientIPs.length > 0 ? clientIPs[0] : undefined;
    let country = req.headers['cf-ipcountry'];

    if (country === undefined) {
        logger.debug('Country code not found in headers, defaulting to "il"')
        country = "il"
    } else {
        logger.debug(`Country code identified as: ${country}`)
    }

    res.status(200).json({ country });
};

exports.email = async (req, res) => {
    const query = req.query
    const email = query.email
    logger.info(`Email validation request for: ${email}`)

    try {
        const check = await bl.valid_email(email)
        logger.debug(`Email validation result for ${email}: ${JSON.stringify(check)}`)
        res.status(200).json(check)
    }
    catch (error) {
        logger.error(`Email validation error for ${email}:`, error)
        res.status(503).json({ "e": "yes", "status": error })
    }
};

exports.login = async (req, res) => {
    logger.info('Processing login request')

    const forwardedFor = req.headers['x-forwarded-for'];
    const clientIPs = forwardedFor ? forwardedFor.split(',').map(ip => ip.trim()) : [];
    const ip = clientIPs.length > 0 ? clientIPs[0] : undefined;
    const userAgent = req.headers['user-agent'];
    const email = req.body.email;
    const password = req.body.password;

    logger.debug(`Login attempt for email: ${email}, IP: ${ip}`)

    try {
        // בדיקת תקינות קלט
        if (!email || !password) {
            logger.warn(`Login failed - invalid credentials: email=${!!email}, password=${!!password}`)
            throw new Error('Invalid email or password');
        }

        // קריאה לשירות חיצוני עם נתונים המקושרים לקלט
        const datas = await bl.login(email, password, ip, userAgent);

        if (datas.e === "yes") {
            // החזרת תגובת שגיאה במקרה של שגיאה מהשירות החיצוני
            logger.warn(`Login failed for ${email}: ${datas.error}`)
            res.status(409).json({ "e": "yes", "error": datas.error });
        } else {
            // הגדרת טוקן ושליחתו בעוגיה
            logger.info(`Login successful for ${email}`)
            console.info("datas3",datas);
            
            const token = datas.jwt;
            res.cookie('sky', token, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000) // 3 שעות ו־15 דקות במילישניות
            });
            logger.debug(`JWT cookie set for ${email}`)

            // בניית הקישור לדף Swagger
            const redirectUrl = 'https://skyrocket.onrender.com/search_form.html';

          
            // הפניה לדף Swagger בתגובה המוחזרת, כולל פרטי המשתמש
            res.status(200).json({
                "e": datas.e,
                "redirectUrl": redirectUrl,
            });

        }
    } catch (error) {
        // טיפול בשגיאה במידה והיא מתרחשת
        logger.error('Login error:', error)
        res.status(503).json({ 'error': 'The request failed, try again later', error: error.message });
    }
};

exports.signup = async (req, res) => {
    try {
        logger.info('Processing signup request')
        logger.debug(`Signup request body: ${JSON.stringify(req.body)}`)

        const email = req.body.email;
        const password = req.body.password;
        const authProvider = req.body.authProvider;
        const loginUrl = 'https://skyrocket.onrender.com/login.html';

        logger.debug(`Attempting signup for ${email} with auth provider: ${authProvider}`)
        const user = await bl.signup(email, password, authProvider)
        logger.debug(`Signup response: ${JSON.stringify(user)}`)

        if (user.e === "yes") {
            logger.warn(`Signup failed for ${email}: ${user.error}`)
            res.status(409).json({ "e": "yes", "error": `${user.error}`, "loginUrl": loginUrl });
        }
        else {
            if (user.res.mongo_id !== undefined) {
                logger.info(`Signup successful for ${email} with ID: ${user.res.id}`)
                // הפניה לדף login בתגובה המוחזרת
                res.status(200).json({ "e": "no", "id": user.res.id });
            }
        }
    }
    catch (error) {
        logger.error('Signup error:', error)
        res.status(503).json({ 'error': 'The request failed, try again later', error });
    }
};
exports.getMyDetails = async (req, res) => {
    // ה-Middleware 'protect' כבר רץ ואימת את המשתמש
    // פרטי המשתמש (מהטוקן) נמצאים ב-req.user
    console.log("a",req.user);
    
    const userIdFromToken = req.user.id; 

    logger.info(`Fetching details for user ID (from token): ${userIdFromToken}`);

    try {
        // השתמש ב-ID מהטוקן כדי לקרוא את הפרטים המלאים מה-DB
        const user = await bl.get_by_id_user(userIdFromToken); // שימוש חוזר בפונקציה קיימת

        if (user && user !== 'Postponed' && user !== false) {
            // שלח חזרה רק את הפרטים הבטוחים (בלי סיסמה וכו')
            res.status(200).json({
                id: user.id,
                username: user.username,
                email: user.email,
                mongo_id: user.mongo_id,
                role_id: user.role_id
            });
        } else {
            logger.warn(`User details not found for ID: ${userIdFromToken}`);
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        logger.error(`Error fetching user details for ID: ${userIdFromToken}:`, error);
        res.status(503).json({ "error": "Failed to retrieve user details", error });
    }
};

exports.usersSearch = async (req, res) => {
    const query = req.query
    const email = query.email
    logger.info(`User search request for email: ${email}`)
    logger.debug(`Search query: ${JSON.stringify(query)}`)

    try {
        const user = await bl.get_by_email_user(email)
        logger.debug(`Search result for ${email}: ${JSON.stringify(user)}`)

        if (!user) {
            logger.warn(`User not found for email: ${email}`)
            return res.status(404).json({ error: `Cannot find user with email: '${email}'` });
        }

        logger.info(`User found for email: ${email}`)
        return res.status(200).json({ e: "no", status: true, authProvider: user });
    }
    catch (error) {
        logger.error(`User search error for ${email}:`, error)
        res.status(500).json({ error: "Internal Server Error. Please try again later." });
    }
};

exports.usersById = async (req, res) => {
    const user_id = req.params.id;
    logger.info(`User details request for ID: ${user_id}`);
    console.log("CON", 1, user_id);

    try {
        const user = await bl.get_by_id_user(user_id);
        console.log("CON", 2, user);


        if (user) {
            if (user !== 'Postponed') {
                logger.info(`User details found for ID: ${user_id}`);
                res.status(200).json(user); 
            } else {
                logger.warn(`Access denied for user ID: ${user_id}`);
                res.status(403).json({ "error": `Access denied, you do not have permission to access the requested Id '${user_id}'` });
            }
        }
        else if (user === false) { 
            logger.warn(`User not found for ID: ${user_id}`);
            res.status(404).json({ "error": `cannot find user with id '${user_id}'` });
        }
        else { 
            logger.error(`Error returned from BL for user ID: ${user_id}:`, user.error);
            res.status(503).json({ "error": `The request failed: '${user.error}'` });
        }
    }
    catch (error) { // שגיאה כללית ברמת ה-Controller
        logger.error(`Error fetching user ID: ${user_id}:`, error);
        res.status(503).json({ "error": `The request failed, try again later '${error}'` });
    }
};

exports.createUser = async (req, res) => {
    const new_user = req.body
    logger.info('Creating new user')
    logger.debug(`New user data: ${JSON.stringify(new_user)}`)

    try {
        const result = await bl.create_user(new_user)
        if (result.ok) {
            logger.info(`User created successfully: ${new_user.username || new_user.email}`)
            res.status(201).json(result)
        }
        else if (result === 'rejected') {
            logger.warn(`User creation rejected - duplicate user: ${new_user.username || new_user.email}`)
            res.status(409).json({ "error": `Username ${new_user.username} or email ${new_user.email} exist in the system` })
        }
        else {
            logger.error('User creation failed')
            res.status(503).json({ "error": `The request failed, try again later` })
        }
    } catch (error) {
        logger.error('Error creating user:', error)
        res.status(503).json({ "error": `The request failed, try again later ${error}` })
    }
};

exports.updateUser = async (req, res) => {
    const user_id = parseInt(req.params.id)
    logger.info(`Updating user with ID: ${user_id}`)

    try {
        const user = await bl.get_by_id_user('id', user_id)
        if (user) {
            const updated_user_req = req.body
            logger.debug(`Update data for user ID ${user_id}: ${JSON.stringify(updated_user_req)}`)

            const result = await bl.update_user(user_id, updated_user_req)
            if (result) {
                logger.info(`User ${user_id} updated successfully`)
                res.status(201).json(result)
            }
            else {
                logger.warn(`User update failed - email already exists: ${updated_user_req.email}`)
                res.status(409).json({ "error": `${updated_user_req.email} already exists` })
            }
        }
        else {
            logger.warn(`User update failed - user not found: ${user_id}`)
            res.status(404).json({ "error": `The id ${user_id} you specified does not exist in the system ` })
            return
        }
    }
    catch (error) {
        logger.error(`Error updating user ${user_id}:`, error)
        res.status(503).json({ "error": `The request failed, try again later ${error}` })
    }
};

// פונקציה חדשה למחיקת החשבון האישי של המשתמש המחובר
exports.deleteMe = async (req, res) => {
    // 1. קח את ה-mongo_id מהטוקן המאומת (שהגיע מה-Middleware)
    const mongo_id_from_token = req.user.id; 
    logger.info(`Attempting self-deletion for user (mongo_id): ${mongo_id_from_token}`);

    try {
        // 2. מצא את פרטי המשתמש המלאים (כולל ה-ID המספרי)
        //    אנו משתמשים בפונקציה שכבר קיימת
        const user = await bl.get_by_id_user(mongo_id_from_token); 
        
        if (user && user.id) {
            const numeric_id = user.id; // זה ה-ID המספרי (למשל 49)
            logger.debug(`Found numeric ID ${numeric_id} for mongo_id ${mongo_id_from_token}`);

            // 3. בצע את המחיקה באמצעות ה-ID המספרי
            const result = await bl.delete_account(numeric_id);
            logger.info(`User ${numeric_id} deleted successfully`);
            
            // 4. נקה את עוגיית ההתחברות ושלח תשובה
            res.clearCookie('sky');
            res.status(200).json({ message: result }); // שלח 200 OK

        } else {
            logger.warn(`User self-deletion failed - user not found for mongo_id: ${mongo_id_from_token}`);
            res.status(404).json({ "error": `User not found` });
        }
    }
    catch (error) {
        logger.error(`Error deleting user ${mongo_id_from_token}:`, error);
        res.status(503).json({ "error": `The request failed, try again later` });
    }
};


exports.customersById = async (req, res) => {
  const user_id = parseInt(req.params.id, 10); 
    logger.info(`Customer details request for ID: ${user_id}`)

    try {
        const user = await bl.get_by_id_customer(user_id)
        if (user) {
            logger.info(`Customer details found for ID: ${user_id}`)
            res.status(200).json(user)
        }
        else {
            logger.warn(`Customer not found for ID: ${user_id}`)
            res.status(404).json({ "error": `cannot find user with id ${user_id}` })
        }
    }
    catch (error) {
        logger.error(`Error fetching customer ID: ${user_id}:`, error)
        res.status(503).json({ "error": `The request failed, try again later` })
    }
};

exports.createCustomer = async (req, res) => {
    const signupUrl = 'https://skyrocket.onrender.com/login.html';
    const new_user = req.body
    logger.info('Creating new customer')
    logger.debug(`New customer data: ${JSON.stringify(new_user)}`)

    try {
        const user = await bl.new_customer(new_user)
        if (user) {
            logger.info('Customer created successfully')
            res.status(201).json({ "e": "no", "signupUrl": signupUrl })
        }
        else {
            logger.warn('Customer creation failed - duplicate customer')
            res.status(409).json({ "e": "yes", "error": `There is a customer with the details I mentioned` })
        }
    }
    catch (error) {
        logger.error('Error creating customer:', error)
        res.status(503).json({ "error": `The request failed, try again later` })
    }
};

exports.updateCustomer = async (req, res) => {
    const user_id = parseInt(req.params.id)
    const updated_user_req = req.body
    logger.info(`Updating customer with ID: ${user_id}`)
    logger.debug(`Update data for customer ID ${user_id}: ${JSON.stringify(updated_user_req)}`)

    try {
        // user exists ==> perform update
        const result = await bl.update_customer(user_id, updated_user_req)
        logger.info(`Customer ${user_id} updated successfully`)
        res.json(updated_user_req)
    }
    catch (error) {
        logger.error(`Error updating customer ${user_id}:`, error)
        res.status(503).json({ "error": `The request failed, try again later` })
    }
};

/**
 * Controller function to get all unique origin countries.
 * (GET /api/countries/origins)
 */
exports.getAllOriginCountries = async (req, res) => {
    logger.info('Received request for all origin countries');
    try {
        // 1. קרא לפונקציית ה-BL הרלוונטית
        const countries = await bl.get_all_origin_countries();

        // 2. שלח את התוצאות חזרה לפרונט-אנד
        logger.info(`Successfully retrieved ${countries.length} origin countries`);
        res.status(200).json(countries);

    } catch (error) {
        // 3. טיפול בשגיאות
        logger.error('Error in getAllOriginCountries controller:', error);
        res.status(500).json({ "error": "The request failed, try again later", "details": error.message });
    }
};

/**
 * Controller function to get all unique destination countries from a specific origin.
 * (GET /api/countries/destinations?origin_id=5)
 */
exports.getDestinationsFromOrigin = async (req, res) => {
    logger.info('Received request for destinations from origin');
    try {
        // 1. קרא את ה-ID מה-query parameters
        const originId = req.query.origin_id;
        logger.debug(`Fetching destinations for origin ID: ${originId}`);

        // 2. קרא לפונקציית ה-BL הרלוונטית
        // ה-BL כבר מכיל ולידציה למקרה ש-originId חסר
        const destinations = await bl.get_destinations_from_origin(originId);

        // 3. שלח את התוצאות חזרה לפרונט-אנד
        logger.info(`Successfully retrieved ${destinations.length} destinations for origin ${originId}`);
        res.status(200).json(destinations);

    } catch (error) {
        // 4. טיפול בשגיאות
        logger.error('Error in getDestinationsFromOrigin controller:', error);
        res.status(500).json({ "error": "The request failed, try again later", "details": error.message });
    }
};

exports.getFilteredFlights = async (req, res) => {
    logger.info('Received request for filtered flights');

    try {
        // 1. קרא את הפילטרים מה-query parameters של הבקשה
        // אלה נשלחים מהפרונט-אנד (למשל: /api/flights/search?date=2025-11-20&origin_country_id=1)
        const filters = {
            origin_country_id: req.query.origin_country_id,
            destination_country_id: req.query.destination_country_id,
            date: req.query.date // 'date' יכיל את התאריך או יהיה undefined אם לא נשלח
        };

        logger.debug(`Filtering flights with criteria: ${JSON.stringify(filters)}`);

        // 2. קרא לפונקציית ה-BL (שיצרנו קודם) והעבר לה את הפילטרים
        const flights = await bl.get_filtered_flights(filters);

        // 3. שלח את התוצאות המסוננות חזרה לפרונט-אנד
        logger.info(`Successfully retrieved ${flights.length} filtered flights`);
        res.status(200).json(flights);

    } catch (error) {
        // 4. במקרה של שגיאה ב-BL או ב-DAL, שלח תגובת שגיאה
        logger.error('Error in getFilteredFlights controller:', error);
        res.status(500).json({ "error": "The request failed, try again later", "details": error.message });
    }
};

exports.get_all_flights = async (req, res) => {
    logger.info('Retrieving all flights')
    try {
        const flights = await bl.get_all_flights()
        logger.debug(`Retrieved ${flights.length} flights`)
        res.json(flights)
    }
    catch (error) {
        logger.error('Error retrieving flights:', error)
        res.json({ 'error': JSON.stringify(error) })
    }
};

exports.getFlightById = async (req, res) => {
    const flight_id = parseInt(req.params.id)
    logger.info(`Flight details request for ID: ${flight_id}`)

    try {
        const flight = await bl.get_by_id_flights(flight_id)
        if (flight) {
            logger.info(`Flight details found for ID: ${flight_id}`)
            res.json(flight)
        }
        else {
            logger.warn(`Flight not found for ID: ${flight_id}`)
            res.status(404).json({ "error": `cannot find flight with id ${flight_id}` })
        }
    }
    catch (error) {
        logger.error(`Error fetching flight ID: ${flight_id}:`, error)
        res.status(503).json({ "error": `The request failed, try again later` })
    }
};

/**
 * Controller function to create a new chair assignment.
 * (POST /api/chairs)
 */
exports.createChairAssignment = async (req, res) => {
    logger.info('Received request to create chair assignment');
    try {
        const chairData = req.body; // { flight_id, char_id, passenger_id, user_id }
        logger.debug(`Chair assignment data: ${JSON.stringify(chairData)}`);

        // כאן חסר user_id, ייתכן שתצטרך לשלוף אותו מה-JWT
        // לדוגמה: chairData.user_id = req.user.id; 

        const assignment = await bl.new_chair_assignment(chairData);

        res.status(201).json(assignment);

    } catch (error) {
        logger.error('Error in createChairAssignment controller:', error);
        // בדוק אם זו שגיאת "כיסא תפוס"
        if (error.code === '23505') { // קוד שגיאה של PostgreSQL ל-Unique Violation
            res.status(409).json({ "error": "This seat is already taken." });
        } else {
            res.status(500).json({ "error": "The request failed, try again later", "details": error.message });
        }
    }
};

exports.createTicket = async (req, res) => {
    const new_ticket = req.body
    logger.info('Creating new ticket')
    logger.debug(`New ticket data: ${JSON.stringify(new_ticket)}`)

    try {
        const result = await bl.purchase_ticket(new_ticket)
        logger.info('Ticket purchased successfully')
        res.status(201).json(result)
    }
    catch (error) {
        logger.error('Error purchasing ticket:', error)
        res.status(503).json({ "error": `The request failed, try again later` })
    }
};

exports.getAllChairsByFlightId = async (req, res) => {
    const id = parseInt(req.params.id)
    logger.info(`Retrieving chairs for flight ID: ${id}`)

    try {
        const result = await bl.get_all_chairs_by_flight(id)
        logger.debug(`Retrieved ${result.length} chairs for flight ${id}`)
        res.status(201).json(result)
    }
    catch (error) {
        logger.error(`Error retrieving chairs for flight ${id}:`, error)
        res.status(503).json({ "error": `The request failed, try again later` })
    }
};

exports.createPassenger = async (req, res) => {
    const new_passenger = req.body
    logger.info('Creating new passenger')
    logger.debug(`New passenger data: ${JSON.stringify(new_passenger)}`)

    try {
        const result = await bl.new_passenger(new_passenger)
        logger.info('Passenger created successfully')
        res.status(201).json(result)
    }
    catch (error) {
        logger.error('Error creating passenger:', error)
        res.status(503).json({ "error": `The request failed, try again later` })
    }
};

exports.PassengerById = async (req, res) => {
    const passenger_id = parseInt(req.params.id)
    logger.info(`Passenger details request for ID: ${passenger_id}`)

    try {
        const passenger = await bl.get_by_id_passenger(passenger_id)
        if (passenger) {
            logger.info(`Passenger details found for ID: ${passenger_id}`)
            res.status(200).json(passenger)
        }
        else {
            logger.warn(`Passenger not found for ID: ${passenger_id}`)
            res.status(404).json({ "error": `cannot find passenger with id ${passenger_id}` })
        }
    }
    catch (error) {
        logger.error(`Error fetching passenger ID: ${passenger_id}:`, error)
        res.status(503).json({ "error": `The request failed, try again later` })
    }
}; 