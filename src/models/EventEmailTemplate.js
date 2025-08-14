/**
 * @swagger
 * components:
 *   schemas:
 *     EventEmailTemplate:
 *       type: object
 *       required:
 *         - EventId
 *         - eventEmailTemplate
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the event email template.
 *         EventId:
 *           type: integer
 *           description: The ID of the associated event.
 *         eventEmailTemplate:
 *           type: string
 *           description: The HTML content of the email template.
 *         designTemplate:
 *           type: object
 *           description: The JSON design template for the email.
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
 *         eventEmailTemplate: "<p>Hello, this is a test email template.</p>"
 *         createdAt: "2023-01-01T12:00:00Z"
 *         updatedAt: "2023-01-01T12:00:00Z"
 */
module.exports = (sequelize, DataTypes) => {
  const EventEmailTemplate = sequelize.define('EventEmailTemplate', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    EventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Events',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    eventEmailTemplate: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    designTemplate: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  });

  return EventEmailTemplate;
};