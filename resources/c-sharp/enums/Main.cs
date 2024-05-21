using NamespaceEnumA;
using NamespaceEnumB;

namespace Programm
{
    class Program
    {
         public static void Main()
        {
            EnumClass.DaysOfWeek today = EnumClass.DaysOfWeek.Wednesday;
            
            DaysOfWeekB todayGerman = DaysOfWeekB.Mittwoch;

            Console.WriteLine("Today is " + today + " (" + todayGerman + ")");

            switch (today)
            {
                case EnumClass.DaysOfWeek.Monday:
                case EnumClass.DaysOfWeek.Tuesday:
                case EnumClass.DaysOfWeek.Wednesday:
                case EnumClass.DaysOfWeek.Thursday:
                case EnumClass.DaysOfWeek.Friday:
                    Console.WriteLine("It's a weekday. Keep working!");
                    break;
                case EnumClass.DaysOfWeek.Saturday:
                case EnumClass.DaysOfWeek.Sunday:
                    Console.WriteLine("It's the weekend. Enjoy!");
                    break;
            }
        }
    }
}
