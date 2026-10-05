import java.sql.*;

public class VerifyDb {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/courierdb";
        String user = "root";
        String password = "alexjose";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("✅ Connected to MySQL Database (courierdb)!");

            // 1. SHOW TABLES
            System.out.println("\n--- SHOW TABLES ---");
            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery("SHOW TABLES")) {
                while (rs.next()) {
                    System.out.println("Table: " + rs.getString(1));
                }
            }

            // 2. CHECK CREATE TABLES
            String[] tables = {"CUSTOMERS", "PARCELS", "DELIVERY_AGENTS", "TRACKING"};
            System.out.println("\n--- TABLE STATUS ---");
            for (String table : tables) {
                try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery("SHOW CREATE TABLE " + table)) {
                    if (rs.next()) {
                        System.out.println("✅ " + table + " exists.");
                    }
                } catch (Exception e) {
                    System.out.println("❌ " + table + " missing: " + e.getMessage());
                }
            }

            // 3. SHOW PROCEDURES
            System.out.println("\n--- PROCEDURES ---");
            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery("SHOW PROCEDURE STATUS WHERE Db = 'courierdb'")) {
                while (rs.next()) {
                    System.out.println("Procedure: " + rs.getString("Name"));
                }
            }

            // 4. SHOW FUNCTIONS
            System.out.println("\n--- FUNCTIONS ---");
            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery("SHOW FUNCTION STATUS WHERE Db = 'courierdb'")) {
                while (rs.next()) {
                    System.out.println("Function: " + rs.getString("Name"));
                }
            }

            // 5. SHOW TRIGGERS
            System.out.println("\n--- TRIGGERS ---");
            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery("SHOW TRIGGERS FROM courierdb")) {
                while (rs.next()) {
                    System.out.println("Trigger: " + rs.getString("Trigger"));
                }
            }

            // 6. RUN JOIN QUERY
            System.out.println("\n--- JOIN QUERY ---");
            String joinQuery = "SELECT p.parcel_id, c.customer_name, a.agent_name FROM PARCELS p JOIN CUSTOMERS c ON p.customer_id = c.customer_id LEFT JOIN DELIVERY_AGENTS a ON p.agent_id = a.agent_id LIMIT 3";
            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(joinQuery)) {
                while (rs.next()) {
                    System.out.println("Parcel ID: " + rs.getInt(1) + ", Customer: " + rs.getString(2) + ", Agent: " + rs.getString(3));
                }
            }

            // 7. RUN SUBQUERY
            System.out.println("\n--- SUBQUERY (Above Average Agents) ---");
            String subquery = "SELECT a.agent_name FROM DELIVERY_AGENTS a WHERE (SELECT COUNT(*) FROM PARCELS p WHERE p.agent_id = a.agent_id) > (SELECT AVG(p_count) FROM (SELECT COUNT(*) as p_count FROM PARCELS GROUP BY agent_id) AS temp)";
            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(subquery)) {
                while (rs.next()) {
                    System.out.println("Agent: " + rs.getString(1));
                }
            }

        } catch (SQLException e) {
            System.out.println("❌ Database Error: " + e.getMessage());
            System.out.println("Make sure MySQL is running and the database 'courierdb' has been imported.");
        }
    }
}
