class Logic{
    public boolean andFunc(){
        return function1() && !function2();
    }
    public boolean orFunc(){
        return !function1() || function2();
    }
    boolean function1(){
        return false;
    }
    boolean function2(){
        return true;
    }

}