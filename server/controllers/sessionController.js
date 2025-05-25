const axios = require('axios');
const moment = require('moment-timezone');

function redirectToLogin(req, res) {
    res.status(200).send(`
        <script>
            document.cookie = 'redirect=${req.originalUrl}; max-age=3600';
            window.location.href = '/login.html';
        </script>
    `);
}

exports.activation = async (req, res) => {
    try {
        const cookies = req.headers.cookie?.split(';').map(cookie => cookie.trim()) || [];
        const skyToken = cookies.find(cookie =>
            cookie.startsWith('sky=') || cookie.startsWith('sky-jwt=')
        ); if (!skyToken) {
            return res.status(404).json('on');
        }
        res.status(200).json('ok');
    } catch (e) {
        res.status(500).json(e);
    }
};

exports.logout = async (req, res) => {
    try {
        res.clearCookie('sky');
        redirectToLogin(req, res);
    } catch (e) {
        res.status(500).json(e);
    }
};

exports.rootHandler = async (req, res, next) => {
    try {
        const allowedPaths = ['/login.html', '/search_form.html', '/registration.html', '/git', '/google'];
        if (allowedPaths.includes(req.path)) return next();

        const cookies = req.headers.cookie?.split(';').map(cookie => cookie.trim()) || [];
        const skyToken = cookies.find(cookie => cookie.startsWith('sky='));

        if (!skyToken) return redirectToLogin(req, res);

        const token = skyToken.split('=')[1];
        const response = await axios.get('https://jwt-node-mongodb.onrender.com/data', {
            data: { token }
        });

        if (response.data.valid) {
            const israelTime = moment.tz(Date.now(), 'Asia/Jerusalem');
            res.clearCookie('sky');
            res.cookie('sky', token, {
                httpOnly: true,
                sameSite: 'strict',
                expires: israelTime.add(3, 'hours').add(15, 'minutes').toDate()
            });
            return next();
        } else {
            return res.status(200).redirect(302, './login.html');
        }
    } catch (e) {
        return res.status(500).send({ error: e, message: 'Internal Server Error' });
    }
};
