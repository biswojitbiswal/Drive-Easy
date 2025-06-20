import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CarService } from "./car.service";


@ApiTags('Car')
@Controller({
    path: 'car',
    version: 'v1'
})
export class CarController {
    constructor(
        private readonly carService: CarService,
    ){}
}