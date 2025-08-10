/* @swagger
 * components:
 *   schemas:
 *     VerifiedEmailTemplate:
 *       type: object
 *       required:
 *         - EventId
         - eventVerifiedEmailTemplate
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the verified email template.
 *         EventId:
           type: integer
           description: The ID of the associated event.
         eventVerifiedEmailTemplate:
           type: string
           description: The HTML content of the verified email template.
         designTemplate:
           type: object
           description: The JSON design template for the verified email.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time the template was created.
 *         updatedAt: 
 *           type: string
 *           format: date-time
 *           description: The date and time the template was last updated.
 *       example:
 *         id: 1
 *         EventId: 101
         eventVerifiedEmailTemplate: "<p>Hello, this is a verified email template.</p>"
 *         createdAt: "2023-01-01T12:00:00Z"
 *         updatedAt: "2023-01-01T12:00:00Z"
 */
module.exports = (sequelize, DataTypes) => {
  const VerifiedEmailTemplate = sequelize.define('VerifiedEmailTemplate', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    EventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    eventVerifiedEmailTemplate: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    designTemplate: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  });

  return VerifiedEmailTemplate;
};