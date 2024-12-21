<%@ include file = "upun.html" %>
<%@ page import = "java.sql.*" %>
<%
String op = request.getParameter("oldusername");
String np = request.getParameter("newusername");


try{
    Class.forName("com.mysql.jdbc.Driver");
    Connection conn = DriverManager.getConnection("jdbc:mysql://127.0.0.1:3306/sanjjey?sslmode=disable","root","jeysanjjey2736");
    String query = "update login_coach set username=? where username=?";
    PreparedStatement ps = conn.prepareStatement(query);
    ps.setString(1,np);
    ps.setString(2,op);
    int x= ps.executeUpdate();
    response.sendRedirect("coach.html");
}
catch(Exception e){
    out.println(e);
    }
%>