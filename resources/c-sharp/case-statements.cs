double z = 0.0;

switch (z) {
    case < 0.0:
        break;
    case > 15.0:
        break;
    case 0:
        goto case double.NaN;
    case double.NaN:
        break;
    default:
        break;
}