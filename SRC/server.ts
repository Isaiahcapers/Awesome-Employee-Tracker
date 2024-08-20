import express from 'express';
// import { QueryResult } from 'pg';
import { pool, connectToDb } from './connection.js';
import inquirer from 'inquirer';
import 'console.table';
await connectToDb();

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

class MenuCli {
    static async getRoleChoices() {
        try {
            const query = 'SELECT id, title, department_id FROM role';
            const result = await pool.query(query);
            const roleChoices = result.rows.map(row => ({ value: row.id, name: row.title,  }));
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
            const managerChoices = result.rows.map(row => ({
                name:`${row.first_name} ${row.last_name}`,
                value:row.id
            }));
            return managerChoices;
        } catch (error) {
            console.error('Error fetching manager choices:', error);
            return [];
        }
    }

    static async viewDepartments() {
        try {
            const res = await pool.query('SELECT id, name FROM department');
            const departments = res.rows.map(department => ({
                name: department.name,
                value: department.id
            }));
            console.table(departments);
            MenuCli.startCli();
            return departments;
        } catch (err) {
            console.error('Error fetching departments:', err);
            throw err;
        }
    }

    static async viewRoles(){
        try {
         const res = await pool.query(
            `SELECT title,id as role_id,salary,department_id FROM role;`,);   
            console.table(res.rows);
            MenuCli.startCli();
            return res.rows;          
        } catch (err) {
            throw err;
        }
        
    };

    static async viewEmployees(returnToMenu = true) {
        try {
            const query = `
                SELECT employee.id as employee_id, employee.first_name, employee.last_name, 
                       role.title, role.salary, department.name as department_name, 
                       manager.first_name as manager_first_name
                FROM employee
                LEFT JOIN role ON employee.role_id = role.id
                LEFT JOIN department ON role.department_id = department.id
                LEFT JOIN employee as manager ON employee.manager_id = manager.id;
            `;
            
            const result = await pool.query(query);
            console.table(result.rows);
            
            const employeeData = result.rows.map(row => ({
                name: `${row.first_name} ${row.last_name}`, // Displayed in the choices
                value: row.employee_id // Actual value to be used
            }));
            if (returnToMenu) {
                MenuCli.startCli();  // Return to main menu after printing
            }
            // MenuCli.startCli();
            
            return employeeData;
        } catch (error) {
            console.error('Error fetching employees:', error);
            return [];
        }
    }

    static async addDepartment() {
        try {
            const answers = await inquirer.prompt([{
                type: 'input',
                name: 'addDepartment',
                message: 'What is the name of the department?'
            }]);
            const deptName = answers.addDepartment;
            const res = await pool.query(`INSERT INTO department (name) VALUES ($1)`, [deptName]);
            console.table(res.rows);
            console.log('Department added Successfully!');
            MenuCli.startCli();
        } catch (err) {
            throw err;
        }
    } 
    
    static async getDepartmentIdByTitle(title:string) {
        const query = 'SELECT id FROM department WHERE name = $1';
        const values = [title];
    
        const result = await pool.query(query, values);
        return result.rows[0].id;
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
            const departmentTitle = answers.AddDepartment;
            const department = await MenuCli.getDepartmentIdByTitle(departmentTitle);
            if (!department) {
                throw new Error(`Department with title "${departmentTitle}" not found.`);
            }
            const departmentId = department.id;
            const res = await pool.query(`INSERT INTO role (title,salary,department_id) VALUES ($1, $2, $3)`,[roleName, roleSalary, departmentId]);
            console.log('Role added Successfully!');
            console.table('Query result:',res.rows);
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
            // const selectedRole = answers.EmpRole;
            const eManager = answers.WhoManager;
            const selectedRoleId = answers.EmpRole
            await pool.query(`INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES ($1, $2, $3, $4)`,[firstName,lastName,selectedRoleId,eManager]);
            console.table('Role added Successfully!');
            MenuCli.startCli();            
        } catch (err) {
            console.log('Error adding role:',err);
        }
    }

    static async updateemployee() {
        try {
            const employees = await MenuCli.viewEmployees(false);
            const answers = await inquirer.prompt([{
                type: 'list',
                name: 'whichEmployee',
                message: 'Which Employee\'s Role do you want to Update?',
                choices: employees
            },
            {
                type: 'list',
                name: 'whichRole',
                message: 'What is the new Role?',
                choices: await MenuCli.getRoleChoices()
            }
        ]);
            const selectedEmployee = answers.whichEmployee;
            const selectedRole = answers.whichRole;
            const query = {
                text: 'UPDATE employee SET role_id = $1 WHERE id = $2',
                values: [selectedRole, selectedEmployee]
            };
    
            await pool.query(query);
            console.log('Employee role updated successfully!');
            MenuCli.startCli();
        } catch (error) {
            console.log('An error occurred:',error);
        }
    }
    static async exitApp () {
        console.log(
            'Exiting the application. Goodbye!');
        process.exit(0);
    }

    static startCli(): void {
        inquirer
        .prompt ([
            {
                type: 'list',
                name: 'ViewAddUpdate',
                message: 
                ' Would you like to view all departments, view all roles, view all employees, add a department, add a role, add an employee or update an employee role?',
                choices: ['view all departments', 'view all roles', 'view all employees', 'add a department', 'add a role', 'add an employee', 'update an employee role','Exit'],
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
            }else if (answers.ViewAddUpdate === 'Exit') {
                MenuCli.exitApp();
            }
        });
    }
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
MenuCli.startCli();
export default MenuCli;