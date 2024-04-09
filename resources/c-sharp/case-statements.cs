double z = 0.0;
int a = 3;
int b = 5;
switch (z) {
    case < 0.0:
        break;
    case > 15.0:
        break;
    case 0:
        goto case double.NaN;
    case double.NaN:
        break;
    case (== 7.0) when a == b: //case guard
        break;
    default:
        break;
}
