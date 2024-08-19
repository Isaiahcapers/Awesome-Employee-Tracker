import express from 'express';
// import { QueryResult } from 'pg';
import { pool, connectToDb } from './connection.js';
import inquirer from 'inquirer';

await connectToDb();

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

class MenuCli {
    static async getRoleChoices() {
        try {
            const query = 'SELECT title FROM role';
            const result = await pool.query(query,);
            const roleChoices = result.rows.map(row => row.title);
            return roleChoices;
        } catch (error) {
            console.error('Error fetching role choices:', error);
            return [];
        }
    }

    static async getManagerChoices() {
        try {
            const query = 'SELECT first_name, last_name FROM employee WHERE manager_id IS NULL';
            const result = await pool.query(query);
            const managerChoices = result.rows.map(row => `${row.first_name} ${row.last_name}`);
            return managerChoices;
        } catch (error) {
            console.error('Error fetching manager choices:', error);
            return [];
        }
    }

    static async viewDepartments() {
        try {
            const res = await pool.query('SELECT id, name FROM department');
            return res.rows.map(department => ({
                name: department.name,
                value: department.id
            }));
            MenuCli.startCli();
            return res.rows;
        } catch (err) {
            console.error('Error fetching departments:', err);
            throw err;
        }
    }

    static async viewRoles(){
        try {
         const res = await pool.query(
            `SELECT title,id as role_id,salary,department_id FROM role;`,);   
            console.log(res.rows);
            MenuCli.startCli();
            return res.rows;          
        } catch (err) {
            throw err;
        }
        
    };

    static async viewEmployees() {
        try {
          const res = await pool.query(
            `SELECT employee.id as employee_id, employee.first_name, employee.last_name, role.title, role.salary, department.name as department_name, manager.first_name as manager_first_name
            FROM employee
            LEFT JOIN role ON employee.role_id = role.id
            LEFT JOIN department ON role.department_id = department.id
            LEFT JOIN employee as manager ON employee.manager_id = manager.id;`,);
            console.log(res.rows);
            MenuCli.startCli();
            return res.rows; 
        } catch (err) {
            throw err;
        }
        
    };

    static async addDepartment() {
        try {
            const answers = await inquirer.prompt([{
                type: 'input',
                name: 'addDepartment',
                message: 'What is the name of the department?'
            }]);
            const deptName = answers.addDepartment;
            const res = await pool.query(`INSERT INTO department (name) VALUES ($1)`, [deptName]);
            console.log(res.rows);
            console.log('Department added Successfully!');
            MenuCli.startCli();
        } catch (err) {
            throw err;
        }
    } 

    static async addRole() {
        try {
            const answers = await inquirer.prompt([{
                type: 'input',
                name:'AddRole',
                message:'What is the title of the role?'
            },
            {
                type: 'input',
                name:'AddSalary',
                message:'What is the salary of the role?'
            },
            {
                type: 'list',
                name:'AddDepartment',
                message:'What Department does the Role belong to?',
                choices: await MenuCli.viewDepartments()
                // dept_id is a number so i when i choose a name from the list it needs to correlate to the department_id and either insert a new name and the the table creates a new id or when i choose a selection from the range of id it inserts it as a number that is formatted for how the tbale needs to accept it. 
            }
        ]);
            const roleName = answers.AddRole;
            const roleSalary = answers.AddSalary;
            const roleDepartment = answers.AddDepartment;
            const res = await pool.query(`INSERT INTO role (title,salary,department_id) VALUES ($1, $2, $3)`,[roleName, roleSalary, roleDepartment]);
            console.log('Role added Successfully!');
            console.log('Query result:',res.rows);
            MenuCli.startCli();         
        } catch (err) {
            console.log('Error adding role:',err);          
        }
    }

    static async addEmployee() {
        try {
            const answers = await inquirer.prompt([{
                type: 'input',
                name:'FirstName',
                message:'What is their first name?'
            },
            {
                type: 'input',
                name:'LastName',
                message:'What is their last name?'
            },
            {
                type: 'list',
                name:'EmpRole',
                message:'What is their role?',
                choices: await MenuCli.getRoleChoices()
            },
            {
                type: 'list',
                name:'WhoManager',
                message:'Who Is their manager?',
                choices: await MenuCli.getManagerChoices()
            }
        ]);
            const firstName = answers.FirstName;
            const lastName = answers.LastName;
            const eRole = answers.EmpRole;
            const eManager = answers.WhoManager;
            await pool.query(`INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES ($1, $2, $3, $4)`,[firstName,lastName,eRole,eManager]);
            console.log('Role added Successfully!');          
        } catch (err) {
            console.log('Error adding role:',err);
        }
    }

    static async updateemployee() {
        
    }

    static startCli(): void {
        inquirer
        .prompt ([
            {
                type: 'list',
                name: 'ViewAddUpdate',
                message: 
                ' Would you like to view all departments, view all roles, view all employees, add a department, add a role, add an employee or update an employee role?',
                choices: ['view all departments', 'view all roles', 'view all employees', 'add a department', 'add a role', 'add an employee', 'update an employee role'],
            },
        ])
        .then ((answers) => {
            if (answers.ViewAddUpdate === 'view all departments') {
                MenuCli.viewDepartments();
            } else if (answers.ViewAddUpdate === 'view all roles') {
                MenuCli.viewRoles();
            } else if (answers.ViewAddUpdate === 'view all employees') {
                MenuCli.viewEmployees();
            } else if (answers.ViewAddUpdate === 'add a department') {
                MenuCli.addDepartment();
            } else if (answers.ViewAddUpdate === 'add a role') {
                MenuCli.addRole();
            }else if (answers.ViewAddUpdate === 'add an employee') {
                MenuCli.addEmployee();
            } else if (answers.ViewAddUpdate === 'update an employee role') {
                MenuCli.updateemployee();
             }
        });
    }
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
MenuCli.startCli();
export default MenuCli;