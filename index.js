// בקובץ index.js
console.log('__dirname:', __dirname);
console.log('Full path to app.js:', require('path').join(__dirname, 'server', 'app.js'));
try {
  require('./server/app.js');
  console.log('Successfully loaded app.js');
} catch (error) {
  console.error('Error loading app.js:', error);
}