<%@ include file = "upps.html" %>
<%@ page import = "java.sql.*" %>
<%
String op = request.getParameter("oldpassword");
String np = request.getParameter("newpassword");


try{
    Class.forName("com.mysql.jdbc.Driver");
    Connection conn = DriverManager.getConnection("jdbc:mysql://127.0.0.1:3306/sanjjey?sslmode=disable","root","jeysanjjey2736");
    String query = "update login_coach set password=? where password=?";
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