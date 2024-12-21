<%@ include file = "register.html" %>
<%@ page import = "java.sql.*" %>
<%@ page import = "jprog.*"%>
<%
String username = request.getParameter("s_username");
String password = request.getParameter("s_password");
String email = request.getParameter("s_email");
String age = request.getParameter("s_age");
try{
    Class.forName("com.mysql.jdbc.Driver");
    Connection conn = DriverManager.getConnection("jdbc:mysql://127.0.0.1:3306/sanjjey?sslmode=disable","root","jeysanjjey2736");
    PreparedStatement ps = conn.prepareStatement("insert into login_coach values(?,?,?,?);");
    PreparedStatement ps2 = conn.prepareStatement("select * from login_coach where username=? and password=? and email =? and age=?;");
    Signin sn = new Signin(username,password,email,age);
    String s = sn.Display();
    String error = sn.usernameValid(username);
    if(error=="" && sn.passwordStrength(password)){
        ps.setString(1,username);
        ps.setString(2,password);
        ps.setString(3,email);
        ps.setString(4,age);

        ps2.setString(1,username);
        ps2.setString(2,password);
        ps2.setString(3,email);
        ps2.setString(4,age);

        int x = ps.executeUpdate();
        ResultSet rs = ps2.executeQuery();
        if(rs.next()){
            System.out.println(s);
            response.sendRedirect("login_page2.html");}
        else{
             out.println("<h1 style='margin-left:23rem;margin-top:-10rem;'>"+"CANNOT ACCESS"+"</h1>");}
        }
        else{
         out.println( "<h3 style='margin-left:24rem;margin-top:-10rem; margin-bottom:3rem;'>The password is weak or Username is Invalid</h3>");
        System.out.println(error);

        }
}
catch(Exception e){
        out.println("<h3 style='margin-left:30rem;margin-top:-10rem; margin-bottom:3rem;'Username is already taken</h3>");
}
catch(NullPointerException e){
    System.out.println();
}
%>
