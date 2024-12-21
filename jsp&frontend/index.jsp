<%@ include file = "register.html"%>
<%@ page import = "java.sql.*" %>
<%@ page import = "jprog.*"%>
<%
String username = request.getParameter("l_username");
String password = request.getParameter("l_password");
String email = request.getParameter("l_email");
String age = request.getParameter("l_age");
String team = request.getParameter("l_team");


try{
    Class.forName("com.mysql.jdbc.Driver");
    Connection conn = DriverManager.getConnection("jdbc:mysql://127.0.0.1:3306/sanjjey?sslmode=disable","root","jeysanjjey2736");
    PreparedStatement ps = conn.prepareStatement("insert into login_player values(?,?,?,?,?);");
    Signin sn = new Signin(username,password,email,age);
    System.out.println(sn.Display());
    String error = sn.usernameValid(username);
    boolean omg = sn.passwordStrength(password);
    if(error=="" && omg){
        PreparedStatement ps2 = conn.prepareStatement("select * from login_player where username=? and password=? and email =? and age=? and team=?");
        ps.setString(1,username);
        ps.setString(2,password);
        ps.setString(3,email);
        ps.setString(4,age);
        ps.setString(5,team);
        ps2.setString(1,username);
        ps2.setString(2,password);
        ps2.setString(3,email);
        ps2.setString(4,age);
        ps2.setString(5,team);

        int x = ps.executeUpdate();
        ResultSet rs = ps2.executeQuery();
        if(rs.next()){
            response.sendRedirect("login_page2.html");
        }
        else{
             out.println("<h1 style='margin-left:23rem;margin-top:-10rem;'>"+"CANNOT ACCESS"+"</h1>");}
        }
        else{
         out.println( "<h3 style='margin-left:24rem;margin-top:-10rem; margin-bottom:3rem;'>Username is short or contains ' ' or the Password is weak </h3>");

        }
}
catch(SQLIntegrityConstraintViolationException e){
    System.out.println(e);
    out.println("<h3 style='margin-left:30rem;margin-top:-10rem; margin-bottom:3rem;'>Username is already taken</h3>");
}
catch(NullPointerException e){
    System.out.println();
}


%>
