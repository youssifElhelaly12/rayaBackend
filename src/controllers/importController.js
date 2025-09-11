const multer = require('multer');
const csv = require('csv-parse');
const fs = require('fs');

const { Tag, User } = require('../models/associations');
// Configure multer for file upload
const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'text/csv') {
            return cb(new Error('Only CSV files are allowed'), false);
        }
        cb(null, true);
    }
}).single('file');

exports.uploadCSV = (req, res, next) => {
    

    upload(req, res, async (err) => {
        const {tagId} = req.body
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a CSV file' });
        }

        const results = [];
        const errors = [];

        fs.createReadStream(req.file.path)
            .pipe(csv.parse({ columns: true, trim: true }))
            .on('data', (data) => {
                results.push(data);
            })
            .on('error', (error) => {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({ message: 'Error parsing CSV file', error: error.message });
            })
            .on('end', async () => {
                try {
                    for (const row of results) {
                        try {
                            // Validate required fields
                            if (!row.email || !row.firstName || !row.lastName || !row.company) {
                                errors.push({ row, error: 'Missing required fields' });
                                continue;
                            }

                            // Validate email format
                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            if (!emailRegex.test(row.email)) {
                                errors.push({ row, error: 'Invalid email format' });
                                continue;
                            }

                            // Check if user already exists
                            const existingUser = await User.findOne({ where: { email: row.email } });
                            if (existingUser) {
                                errors.push({ row, error: `User with this email already exists`, id: existingUser.id });
                                continue;
                            }

                            // Validate Egyptian phone number if provided
                            if (row.phone) {
                                // Egyptian phone numbers: +20xxxxxxxxx or 01xxxxxxxxx (9 digits after prefix)
                                const egyptPhoneRegex = /^(?:\+20|20|0)1[0-2,5]{1}[0-9]{8}$/;
                                if (!egyptPhoneRegex.test(row.phone)) {
                                    errors.push({ row, error: 'Invalid Egyptian phone number format' });
                                    continue;
                                }
                            }

                            // Create new user
                            const newUser = await User.create({
                                lastName: row.lastName,
                                firstName: row.firstName,
                                phone: row.phone,
                                email: row.email,
                                title: row.title,
                                company: row.company,
                            });

                            if (tagId) {
                                const tag = await Tag.findByPk(tagId);
                                if (tag) {
                                    await tag.addUser(newUser);
                                } else {
                                    errors.push({ row, error: `Tag with ID ${tagId} not found.` });
                                }
                            }
                        } catch (error) {
                            errors.push({ row, error: error.message });
                        }
                    }

                    // Clean up uploaded file
                    fs.unlinkSync(req.file.path);

                    res.json({
                        message: 'CSV import completed',
                        totalProcessed: results.length,
                        successCount: results.length - errors.length,
                        errorCount: errors.length,
                        errors: errors
                    });
                } catch (error) {
                    fs.unlinkSync(req.file.path);
                    next(error);
                }
            });
    });
};