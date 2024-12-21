package jprog;

public class Login extends Signin{
    private String un,ps,em,age;
    public Login(String un,String ps,String em,String age) {
        super(un, ps, em, age);
    }
    @Override
    public String usernameValid(String un) throws InvalidUsername {
        return super.usernameValid(un);

    }
    public Login(String un,String age){
        super(un,age);
    }
    @Override
    public String Display(){
        return super.Display();
    }

    public boolean passwordStrength(String ps){
        return super.passwordStrength(ps);
    }



}
