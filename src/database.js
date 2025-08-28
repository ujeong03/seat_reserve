const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = null;
        this.init();
    }

    init() {
        // 환경 감지
        const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_ENVIRONMENT_NAME;
        let dbPath;
        
        if (isRailway) {
            // Railway에서는 프로젝트 루트의 db 파일 사용
            dbPath = path.join(process.cwd(), 'students.db');
            console.log('🚂 Railway 환경: 파일 데이터베이스 사용');
        } else {
            // 로컬 환경에서는 data 폴더 사용
            dbPath = path.join(__dirname, '..', 'data', 'students.db');
            
            // data 디렉토리가 없으면 생성
            const fs = require('fs');
            const dataDir = path.dirname(dbPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            console.log('💻 로컬 환경: data 폴더 사용');
        }

        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('데이터베이스 연결 실패:', err.message);
            } else {
                console.log('✅ SQLite 데이터베이스 연결됨');
                this.createTables();
            }
        });
    }

    createTables() {
        const createStudentsTable = `
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        const createSeatAssignmentsTable = `
            CREATE TABLE IF NOT EXISTS seat_assignments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                seat_id TEXT NOT NULL,
                student_name TEXT NOT NULL,
                student_id TEXT,
                start_date TEXT,
                end_date TEXT,
                is_permanent INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_by TEXT DEFAULT 'admin'
            )
        `;

        this.db.run(createStudentsTable, (err) => {
            if (err) {
                console.error('students 테이블 생성 실패:', err.message);
            } else {
                console.log('✅ students 테이블 생성 완료');
            }
        });

        this.db.run(createSeatAssignmentsTable, (err) => {
            if (err) {
                console.error('seat_assignments 테이블 생성 실패:', err.message);
            } else {
                console.log('✅ seat_assignments 테이블 생성 완료');
            }
        });
    }

    // 학번으로 학생 정보 조회
    getStudentById(studentId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM students WHERE student_id = ?',
                [studentId],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    }

    // 모든 학생 목록 조회 (관리자용)
    getAllStudents() {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM students ORDER BY student_id',
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    // 새 학생 추가 (관리자용)
    addStudent(studentId, name) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO students (student_id, name) VALUES (?, ?)',
                [studentId, name],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: this.lastID, student_id: studentId, name: name });
                    }
                }
            );
        });
    }

    // 학생 정보 삭제 (관리자용)
    deleteStudent(studentId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'DELETE FROM students WHERE student_id = ?',
                [studentId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes > 0);
                    }
                }
            );
        });
    }

    // 좌석 지정 추가 (관리자용)
    addSeatAssignment(seatId, studentName, studentId, startDate, endDate, isPermanent) {
        return new Promise((resolve, reject) => {
            this.db.run(
                `INSERT INTO seat_assignments (seat_id, student_name, student_id, start_date, end_date, is_permanent) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [seatId, studentName, studentId, startDate, endDate, isPermanent ? 1 : 0],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ 
                            id: this.lastID, 
                            seat_id: seatId, 
                            student_name: studentName,
                            student_id: studentId,
                            start_date: startDate,
                            end_date: endDate,
                            is_permanent: isPermanent
                        });
                    }
                }
            );
        });
    }

    // 좌석 지정 삭제 (관리자용)
    removeSeatAssignment(seatId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'DELETE FROM seat_assignments WHERE seat_id = ?',
                [seatId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes > 0);
                    }
                }
            );
        });
    }

    // 현재 유효한 좌석 지정 조회
    getActiveSeatAssignments() {
        return new Promise((resolve, reject) => {
            const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
            
            this.db.all(
                `SELECT * FROM seat_assignments 
                 WHERE is_permanent = 1 
                 OR (start_date <= ? AND end_date >= ?)
                 ORDER BY seat_id`,
                [now, now],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    // 모든 좌석 지정 조회 (관리자용)
    getAllSeatAssignments() {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM seat_assignments ORDER BY created_at DESC',
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('데이터베이스 종료 실패:', err.message);
                } else {
                    console.log('✅ 데이터베이스 연결 종료됨');
                }
            });
        }
    }
}

module.exports = Database;
