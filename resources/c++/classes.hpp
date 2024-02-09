#ifndef CLASSES_HEADER_367734
#define CLASSES_HEADER_367734

class example_class {
};

class super_example_class
{
};

class class_1 : protected super_example_class{
    class nested_class {
    };
    class class_2{
        protected:
            class class_2a{
            };
        public:
            class class_2b
            {
            };
    };
    private:
        class class_3 {
        };
    protected:
        class class_4 {
        };
    public:
        class class_5 {
        };
        class class_6 {
        };
};

#endif