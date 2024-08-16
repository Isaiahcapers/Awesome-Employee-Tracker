INSERT INTO department (name)
VALUES ('Pilots'),
       ('Air Traffic Controllers'),
       ('Maintenace Crew'),
       ('Flight Attendants'),
       ('Administration');

INSERT INTO role (title,salary,department_id)
VALUES ('Captain',250000,1),
       ('First Officer',125000,1),
       ('Air Traffic Controller',175000,2),
       ('Senior Air Traffic Controller',250000,2),
       ('Aircraft Mechanic',100000,3),
       ('Avionics Technician',75000,3),
       ('Flight Attendant',75000,4),
       ('Senior Flight Attendant',100000,4),
       ('Human Resources Manager',150000,5),
       ('Human Resource Assistant',125000,5);

INSERT INTO employee (first_name,last_name,role_id,manager_id)
VALUES ('Isaiah','Capers',1,NULL),
       ('Jessica','Rodrguez',2,NULL),
       ('Santiago','Vasquez',3,NULL),
       ('Maria','Gonzalez',2, 2),
       ('Carlos','Lopez',1, 1), 
       ('Elena','Martinez',3, 3),
       ('Jesus','Cloud',5,NULL), 
       ('Juan','Ramirez',5,5);