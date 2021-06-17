import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { fromEvent } from 'rxjs';
import { distinctUntilChanged, finalize, map } from 'rxjs/operators';
import { ModalService } from 'src/app/shared/components/modal/modal.service';
import { User } from '../shared/user.model';
import { UsersService } from '../shared/users.service';
import { UserModalComponent } from '../user-modal/user-modal.component';
import { AuthService } from 'src/app/auth/shared/auth.service';
import Fuse from 'fuse.js';

@UntilDestroy()
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.sass']
})
export class UsersComponent implements OnInit, AfterViewInit {
  @ViewChild('keyword') keyword!: ElementRef;

  users: User[] = [];
  displayedUsers: User[] = [];
  fetchingUsers = false;
  error: string | null = null;

  constructor(
    private usersService: UsersService,
    public auth: AuthService,
    public modal: ModalService
  ) {}

  ngOnInit(): void {
    this.list();
  }

  ngAfterViewInit(): void {
    fromEvent(this.keyword.nativeElement, 'keyup')
      .pipe(
        map(() => this.keyword.nativeElement.value),
        distinctUntilChanged(),
        untilDestroyed(this)
      )
      .subscribe(keyword => {
        if (keyword === '') {
          this.displayedUsers = [...this.users];
          return;
        }

        const fuse = new Fuse([...this.users], { keys: ['login', 'name', 'email'], threshold: 0.3 });
        this.displayedUsers = fuse.search(keyword).map(r => r.item);
      });
  }

  openUserModal(): void {
    const modalRef = this.modal.open(UserModalComponent, { size: 'medium' });
    modalRef.result.then(
      result => {
        if (result) {
          this.list();
        }
      },
      () => {}
    );
  }

  onUserUpdated(): void {
    this.list();
  }

  list(): void {
    this.fetchingUsers = true;
    this.usersService
      .list()
      .pipe(
        finalize(() => (this.fetchingUsers = false)),
        untilDestroyed(this)
      )
      .subscribe(
        resp => {
          this.users = resp;
          this.displayedUsers = [...this.users];
        },
        err => {
          this.error = err.message;
        }
      );
  }
}

