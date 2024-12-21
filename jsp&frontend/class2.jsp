<%@ include file = "login_page2.html" %>
<%@ page import = "java.sql.*" %>
<%@ page import = "jprog.*"%>
<%
String username = request.getParameter("s_username");
String password = request.getParameter("s_password");
String email = request.getParameter("s_email");
String value1 = username;
String value2 = email;

ResultSet rs;
String query;
try{
    Class.forName("com.mysql.jdbc.Driver");
    Connection conn = DriverManager.getConnection("jdbc:mysql://127.0.0.1:3306/sanjjey?sslmode=disable","root","jeysanjjey2736");
    query = "select * from login_coach where username=? and password=?;";
    PreparedStatement ps = conn.prepareStatement(query);
    ps.setString(1,username);
    ps.setString(2,password);
    rs = ps.executeQuery();
    Login ln = new Login(username,password);
    String error = ln.usernameValid(username);
    if(error==""){
    String value3;
    if(rs.next()){
          Login l = new Login(username,password,rs.getString(3),rs.getString(4));
          String s = l.Display();
          System.out.println(s);
          value3= rs.getString(4);
          System.out.println(value3);
          session.setAttribute("value1",value1);
          session.setAttribute("value2",value2);
          session.setAttribute("value3",value3);
          String sobha = (String) session.getAttribute("value3");
          response.sendRedirect("coach.html");}
    else{
         out.println("<h1 style='margin-left:23rem;margin-top:-10rem;margin-bottom:5rem;'>"+"INVALID CREDENTIALS"+"</h1>");}
    }
    else{
        out.println("<h3 style='margin-left:24rem;margin-bottom:7rem;'>"+error+"</h3>");
    }
}
catch(Exception e){
    out.println(e);
}
%>
