<%@ page import="java.sql.*" %>
<%@ page import="java.io.*" %>
<%
String game = request.getParameter("title");
String strat = request.getParameter("description");
String value = (String) session.getAttribute("value1");
String query;
try {
    Class.forName("com.mysql.jdbc.Driver");
    Connection conn = DriverManager.getConnection("jdbc:mysql://127.0.0.1:3306/sanjjey?sslmode=disable","root","jeysanjjey2736");
    query = "insert into posting values(?,?,?);";
    PreparedStatement ps = conn.prepareStatement(query);
    PreparedStatement ps2 = conn.prepareStatement("select * from posting where username=?;");
    ps.setString(1,value);
    ps.setString(2,strat);
    ps.setString(3,game);
    ps2.setString(1,value);
    int x = ps.executeUpdate();
    ResultSet rs = ps2.executeQuery();
    if(rs.next()){
        response.sendRedirect("succ.html");
    }
    else{
        out.println("ayaioooooo");
        }


} catch(Exception e) {
    out.println(e);
}
%>
