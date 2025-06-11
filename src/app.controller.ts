import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
    @Get('')
    getTest() {
        return 'Hello World, From My Side';
    }

    @Get('/test')
    getExample() {
        return 'I am a Javascript Developer';
    }
}